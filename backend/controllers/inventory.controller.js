import sequelize from '../config/sequelize.js';
import BaseController from './base.controller.js';
import { Inventory, User, Credential } from '../models/index.js';
import { InventoryCreateSchema, InventorySchema, InventoryUpdateSchema } from '../schemas/inventory.schema.js';
import { CredentialSchema } from '../schemas/credential.schema.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import ssh_service from '../services/ssh.service.js';
import discovery_service from '../services/discovery.service.js';
import command_service from '../services/command.service.js';
import AppException from '../exceptions/exception.js';

export class InventoryController extends BaseController {

    constructor() {

        super(Inventory, {
            schema: InventorySchema,
            createSchema: InventoryCreateSchema,
            updateSchema: InventoryUpdateSchema,
            creator: true,
            includes: [
                {
                    model: User,
                    as: 'creator',
                }
            ],
        });
    }

    async update(req, res, next) {
        try {

            const data = InventoryUpdateSchema.parse(req.body);

            const inventory = await sequelize.transaction(
                async transaction => {

                    const record = await Inventory.findOne({
                        where: {
                            id: req.params.id,
                            deleted_at: null
                        },
                        transaction,
                        lock: true,
                    });

                    if (!record) {
                        throw new AppException(
                            "Inventory not found!",
                            HTTP_STATUS.HTTP_404_NOT_FOUND
                        );
                    }

                    const hostnameChanged =
                        data.hostname !== undefined &&
                        data.hostname !== record.hostname;

                    const portChanged =
                        data.ssh_port !== undefined &&
                        data.ssh_port !== record.ssh_port;

                    const updateData = { ...data };

                    if (hostnameChanged || portChanged) {
                        updateData.ssh_host_key_fingerprint = null;
                        updateData.connection_status = 'unknown';
                        updateData.last_connected_at = null;
                    }

                    await record.update(updateData, { transaction });

                    await record.reload({
                        include: this.includes,
                        transaction
                    });

                    return record;
                }
            );

            return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message: 'Inventory updated successfully.',
                data: this.serialize(inventory),
            });

        } catch (e) {

            next(e);

        }
    }

    async inventoryCredentials(req, res, next) {
        try {

            const { id } = req.params

            const inventory = await Inventory.findOne({
                where: {
                    id,
                    deleted_at: null
                }
            });

            if (!inventory) {
                throw new AppException(
                    "Inventory Not found!",
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            const credentials = await Credential.findAll({
                where: {
                    inventory_id: inventory.id,
                    deleted_at: null
                }
            });

            res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message: "Credentials related to inventory retrieved successfully",
                data: {
                    credentials: credentials.map(credential =>
                        CredentialSchema.parse(credential.toJSON())
                    )
                }
            });

        } catch (e) {
            next(e);
        }
    }

    async hostKey(req, res, next) {

        try {

            const { id } = req.params

            const inventory = await Inventory.findOne({
                where: {
                    id,
                    deleted_at: null
                }
            });

            res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message: "connection successfull",
                data: {
                    host_key: inventory.ssh_host_key_fingerprint
                }
            });

        } catch (e) {
            next(e);
        }

    }

    async hostKeyTrust(req, res, next) {
        try {
            const { id } = req.params;
            const { fingerprint } = req.body;

            const inventory = await Inventory.findOne({
                where: {
                    id,
                    deleted_at: null,
                },
            });

            if (!inventory) {
                throw new AppException(
                    'Inventory not found',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            if (!inventory.status) {
                throw new AppException(
                    'Inventory has been disabled.',
                    HTTP_STATUS.HTTP_403_FORBIDDEN
                );
            }

            if (inventory.ssh_host_key_fingerprint !== null) {
                throw new AppException(
                    'A host key is already trusted. Replacement requires a separate review.',
                    HTTP_STATUS.HTTP_409_CONFLICT
                );
            }

            // save only is the target and trust have not changed
            const [updatedCount] = await Inventory.update(
                {
                    ssh_host_key_fingerprint: fingerprint
                },
                {
                    where: {
                        id: inventory.id,
                        hostname: inventory.hostname,
                        ssh_port: inventory.ssh_port,
                        status: true,
                        deleted_at: null,
                        ssh_host_key_fingerprint: null,
                    },
                }
            );

            if (updatedCount !== 1) {
                throw new AppException(
                    'Inventory changed during approval. Reload and review it again.',
                    HTTP_STATUS.HTTP_409_CONFLICT
                );
            }

            return res
                .status(HTTP_STATUS.HTTP_200_OK.status_code)
                .json({
                    success: true,
                    message: 'Approved SSH host-key fingerprint saved.',
                    data: {
                        fingerprint,
                    },
                });
        } catch (e) {
            next(e);
        }
    }


    async testConnection(req, res, next) {

        try {

            const { id } = req.params

            const inventory = await Inventory.findOne({
                where: {
                    id,
                    deleted_at: null
                }
            });

            if (!inventory) {
                throw new AppException(
                    'Inventory not found',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            const credential = await Credential.findOne({
                where: {
                    inventory_id: inventory.id,
                    deleted_at: null
                }
            });

            if (!credential) {
                throw new AppException(
                    'No credential found for this inventory',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            const connection = await ssh_service.testConnection(
                inventory, credential
            );

            // // get the connection details
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = connection.metadata.startedAt;

            // // save the details in db
            await inventory.save();

            res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message: "connection successfull",
                data: {
                    connection,
                    inventory: InventorySchema.parse(inventory.toJSON()),
                    credential: CredentialSchema.parse(credential.toJSON())
                }
            });

        } catch (e) {
            next(e);
        }

    }

    async discover(req, res, next) {
        try {

            const { id } = req.params

            const inventory = await Inventory.findOne({
                where: {
                    id,
                    deleted_at: null
                }
            });

            if (!inventory) {
                throw new AppException(
                    'Inventory not found.',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            const credential = await Credential.findOne({
                where: {
                    inventory_id: inventory.id,
                    deleted_at: null
                }
            });

            if (!credential) {
                throw new AppException(
                    'Credential not found for this inventory.',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            const connection = await discovery_service.discover(
                inventory, credential
            );

            // save discovery details to database
            inventory.discovered_hostname = connection.hostname;
            inventory.os_name = connection.os.name;
            inventory.os_version = connection.os.version;
            inventory.os_version_id = connection.os.version_id;
            inventory.kernel = connection.kernel;
            inventory.architecture = connection.architecture;
            inventory.cpu_cores = connection.cpu_cores;
            inventory.memory_total_kib = connection.memory.total_kib;
            inventory.uptime_seconds = connection.uptime_seconds;
            inventory.inventory_collected_at = new Date(connection.metadata.collectedAt);
            inventory.inventory_partial = connection.metadata.partial;
            inventory.inventory_missing_fields = connection.metadata.missing_fields;
            // Update the existing display field only when discovered.
            if (connection.os.pretty_name) {
                inventory.operating_system = connection.os.pretty_name;
            }
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = new Date(connection.metadata.startedAt);

            // save the inventory details in db
            await inventory.save();

            res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message: "discovery successfull",
                data: {
                    connection,
                    inventory: InventorySchema.parse(inventory.toJSON())
                }
            });

        } catch (e) {
            next(e);
        }
    }

    async execute(req, res, next) {
        try {

            const { id } = req.params
            const { command } = req.body;

            const inventory = await Inventory.findOne({
                where: {
                    id,
                    deleted_at: null
                }
            });

            const credential = await Credential.findOne({
                where: {
                    inventory_id: inventory.id,
                    deleted_at: null
                }
            });

            const connection = await command_service.execute(
                inventory, credential, command
            );

            // get the connection details
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = connection.metadata.startedAt;

            // save the details in db
            await inventory.save();

            res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message: `command executed${connection.commandStatus === "success" ? ' successfully' : ''}`,
                data: {
                    connection
                }
            });

        } catch (e) {
            next(e);
        }
    }

}

const inventory_controller = new InventoryController();

export default inventory_controller;