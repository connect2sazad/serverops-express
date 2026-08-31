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

    async inventoryCredentials(req, res, next) {
        try {

            const { id } = req.params

            const inventory = await Inventory.findOne({
                where: {
                    id,
                    deleted_at: null
                }
            });

            if(!inventory){
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
                        CredentialSchema.safeParse(credential.toJSON())
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

            const credential = await Credential.findOne({
                where: {
                    inventory_id: inventory.id,
                    deleted_at: null,
                },
            });

            if (!credential) {
                throw new AppException(
                    'No credential found for this inventory',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            const connection = await ssh_service.getHostKeyFingerprint(
                inventory,
                credential
            );

            inventory.ssh_host_key_fingerprint = connection.fingerprint;
            await inventory.save();

            return res
                .status(HTTP_STATUS.HTTP_200_OK.status_code)
                .json({
                    success: true,
                    message: 'SSH host key trusted successfully',
                    data: {
                        fingerprint: connection.fingerprint,
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

            const credential = await Credential.findOne({
                where: {
                    inventory_id: inventory.id,
                    deleted_at: null
                }
            });

            const connection = await discovery_service.discover(
                inventory, credential
            );

            // get the connection details
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = connection.metadata.startedAt;

            // save the details in db
            await inventory.save();

            res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message: "discovery successfull",
                data: {
                    connection
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
                message: `command executed${connection.commandStatus==="success" ? ' successfully' : '' }`,
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