import { Op } from 'sequelize';

import BaseController from './base.controller.js';
import { Inventory, ManagedCommand, User } from '../models/index.js';
import { ManagedCommandSchema, ManagedCommandCreateSchema, ManagedCommandUpdateSchema } from '../schemas/managed-command.schema.js';
import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';

class ManagedCommandController extends BaseController {

    constructor() {
        super(ManagedCommand, {
            schema: ManagedCommandSchema,
            createSchema: ManagedCommandCreateSchema,
            updateSchema: ManagedCommandUpdateSchema,
            creator: true,
            includes: [
                {
                    model: User,
                    as: 'creator',
                },
                {
                    model: Inventory,
                    as: 'inventory',
                }
            ]
        });
    }

    async getRecord(req) {
        return await this.getManagedCommand(req);
    }

    async getManagedCommand(req) {

        const managedCommand = await ManagedCommand.findOne({
            where: {
                id: req.params.managed_command_id,
                inventory_id: req.params.id,
                deleted_at: null,
            },
            include: this.includes,
        });

        if (!managedCommand) {
            throw new AppException(
                'Managed Commands are not found for this inventory',
                HTTP_STATUS.HTTP_404_NOT_FOUND
            );
        }

        return managedCommand;

    }

    async getAll(req, res, next) {
        try {

            const inventory = await Inventory.findOne({
                where: {
                    id: req.params.id,
                    deleted_at: null,
                },
            });

            if (!inventory) {
                throw new AppException(
                    'Inventory not found!',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            return await this.getAllPaginatedRecords(
                req,
                res,
                next,
                {
                    inventory_id: inventory.id,
                    deleted_at: null,
                }
            );

        } catch (e) {

            next(e);

        }
    }

    async getOne(req, res, next) {
        try {

            const managedCommand = await this.getManagedCommand(req);

            return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                status: true,
                message: 'Managed Command retrieved successfully!',
                data: this.serialize(managedCommand),
            });

        } catch (e) {

            next(e);

        }
    }

    async create(req, res, next) {
        try {

            const data = this.createSchema.parse(req.body);

            const inventory = await Inventory.findOne({
                where: {
                    id: req.params.id,
                    deleted_at: null
                }
            });

            if (!inventory) {
                throw new AppException(
                    'Inventory not found!',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            const existingCommand = await ManagedCommand.findOne({
                where: {
                    inventory_id: inventory.id,
                    name: data.name
                },
                paranoid: false,
            });

            if (existingCommand && !existingCommand.deleted_at) {
                throw new AppException(
                    'A Managed Command with the same name already exists!',
                    HTTP_STATUS.HTTP_409_CONFLICT
                );
            }

            if (existingCommand?.deleted_at) {
                await existingCommand.restore();

                await existingCommand.update({
                    ...data,
                    creator_id: req.auth.id,
                    status: true,
                });


                await existingCommand.reload({
                    include: this.includes,
                });

                return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                    success: true,
                    message: 'Managed Command restored successfully.',
                    data: this.serialize(existingCommand),
                });

            }

            const managedCommand = await ManagedCommand.create({
                ...data,
                inventory_id: inventory.id,
                creator_id: req.auth.id,
            });

            await managedCommand.reload({
                include: this.includes,
            });

            res.status(HTTP_STATUS.HTTP_201_CREATED.status_code).json({
                success: true,
                message: 'Managed Command created successfully!',
                data: this.serialize(managedCommand),
            });

        } catch (e) {

            next(e);

        }
    }

    async update(req, res, next) {
        try {

            const data = this.updateSchema.parse(req.body);

            const managedCommand = await this.getManagedCommand(req);

            if (
                data.name !== undefined &&
                data.name !== managedCommand.name
            ) {

                const duplicate = await ManagedCommand.findOne({
                    where: {
                        id: {
                            [Op.ne]: managedCommand.id,
                        },
                        inventory_id: managedCommand.inventory_id,
                        name: data.name,
                    },
                    paranoid: false,
                });

                if (duplicate) {
                    throw new AppException(
                        'A Managed Command with this name already exists.',
                        HTTP_STATUS.HTTP_409_CONFLICT
                    );
                }

            }

            await managedCommand.update(data);

            return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message: 'Managed Command updated successfully!',
                data: this.serialize(managedCommand),
            });

        } catch (e) {

            next(e);

        }
    }

}

const managed_command_controller = new ManagedCommandController();
export default managed_command_controller;