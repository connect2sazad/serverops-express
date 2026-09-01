import { Op } from 'sequelize';

import BaseController from './base.controller.js';

import {
    Inventory,
    ManagedService,
} from '../models/index.js';

import {
    ManagedServiceSchema,
    ManagedServiceCreateSchema,
    ManagedServiceUpdateSchema,
} from '../schemas/managed-service.schema.js';

import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';

class ManagedServiceController extends BaseController {

    constructor() {
        super(ManagedService, {
            schema: ManagedServiceSchema,
            createSchema: ManagedServiceCreateSchema,
            updateSchema: ManagedServiceUpdateSchema,
            creator: true,
        });
    }

    async getManagedService(req) {
        const managedService = await ManagedService.findOne({
            where: {
                id: req.params.managed_service_id,
                inventory_id: req.params.id,
                deleted_at: null,
            },
        });

        if (!managedService) {
            throw new AppException(
                'Managed service not found for this inventory.',
                HTTP_STATUS.HTTP_404_NOT_FOUND
            );
        }

        return managedService;
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
                    'Inventory not found.',
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

        } catch (error) {
            next(error);
        }
    }

    async getOne(req, res, next) {
        try {
            const managedService =
                await this.getManagedService(req);

            return res
                .status(HTTP_STATUS.HTTP_200_OK.status_code)
                .json({
                    success: true,
                    message:
                        'Managed service retrieved successfully.',
                    data: this.serialize(managedService),
                });

        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const inventoryId = req.params.id;
            const data = this.createSchema.parse(req.body);

            const inventory = await Inventory.findOne({
                where: {
                    id: inventoryId,
                    deleted_at: null,
                },
            });

            if (!inventory) {
                throw new AppException(
                    'Inventory not found.',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            const existingPolicy = await ManagedService.findOne({
                where: {
                    inventory_id: inventory.id,
                    service_name: data.service_name,
                },
                paranoid: false,
            });

            if (existingPolicy && !existingPolicy.deleted_at) {
                throw new AppException(
                    'This service is already managed for the inventory.',
                    HTTP_STATUS.HTTP_409_CONFLICT
                );
            }

            if (existingPolicy?.deleted_at) {
                await existingPolicy.restore();

                await existingPolicy.update({
                    ...data,
                    creator_id: req.auth.id,
                    status: true,
                });

                return res
                    .status(
                        HTTP_STATUS.HTTP_200_OK.status_code
                    )
                    .json({
                        success: true,
                        message:
                            'Managed service restored successfully.',
                        data: this.serialize(existingPolicy),
                    });
            }

            const managedService =
                await ManagedService.create({
                    ...data,
                    inventory_id: inventory.id,
                    creator_id: req.auth.id,
                });

            await managedService.reload();

            return res
                .status(
                    HTTP_STATUS.HTTP_201_CREATED.status_code
                )
                .json({
                    success: true,
                    message:
                        'Managed service created successfully.',
                    data: this.serialize(managedService),
                });

        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const data = this.updateSchema.parse(req.body);

            const managedService =
                await this.getManagedService(req);

            const permissionFields = [
                'can_restart',
                'can_start',
                'can_stop',
                'can_enable',
                'can_disable',
            ];

            const hasAllowedAction = permissionFields.some(
                field => {
                    if (data[field] !== undefined) {
                        return data[field];
                    }

                    return managedService[field];
                }
            );

            if (!hasAllowedAction) {
                throw new AppException(
                    'At least one service action must remain allowed.',
                    HTTP_STATUS.HTTP_422_UNPROCESSABLE_ENTITY
                );
            }

            if (
                data.service_name !== undefined &&
                data.service_name !==
                    managedService.service_name
            ) {
                const duplicate =
                    await ManagedService.findOne({
                        where: {
                            id: {
                                [Op.ne]: managedService.id,
                            },
                            inventory_id:
                                managedService.inventory_id,
                            service_name:
                                data.service_name,
                        },
                        paranoid: false,
                    });

                if (duplicate) {
                    throw new AppException(
                        'This service name already exists for the inventory.',
                        HTTP_STATUS.HTTP_409_CONFLICT
                    );
                }
            }

            await managedService.update(data);

            return res
                .status(
                    HTTP_STATUS.HTTP_200_OK.status_code
                )
                .json({
                    success: true,
                    message:
                        'Managed service updated successfully.',
                    data: this.serialize(managedService),
                });

        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const managedService =
                await this.getManagedService(req);

            await managedService.destroy();

            return res
                .status(
                    HTTP_STATUS.HTTP_200_OK.status_code
                )
                .json({
                    success: true,
                    message:
                        'Managed service removed successfully.',
                });

        } catch (error) {
            next(error);
        }
    }
}

const managed_service_controller = new ManagedServiceController();
export default managed_service_controller;