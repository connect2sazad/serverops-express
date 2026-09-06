import BaseController from
    './base.controller.js';

import AppException from
    '../exceptions/exception.js';

import HTTP_STATUS from
    '../exceptions/status_codes.js';

import {
    User,
    UserRole,
} from '../models/index.js';

import {
    UserRoleCreateSchema,
    UserRoleSchema,
    UserRoleUpdateSchema,
} from '../schemas/user-role.schema.js';


const PROTECTED_ROLE_SLUGS =
    new Set([
        'admin',
        'administrator'
    ]);


export class UserRoleController
    extends BaseController {

    constructor() {
        const settings = {
            schema:
                UserRoleSchema,

            createSchema:
                UserRoleCreateSchema,

            updateSchema:
                UserRoleUpdateSchema,

            searchFields: [
                'name',
                'slug',
            ],
        };

        super(
            UserRole,
            settings
        );
    }


    isProtectedRole(role) {
        return PROTECTED_ROLE_SLUGS.has(
            role.slug
        );
    }


    assertRoleCanBeModified(role) {
        if (
            this.isProtectedRole(role)
        ) {
            throw new AppException(
                'The administrator role is protected and cannot be modified.',
                HTTP_STATUS.HTTP_403_FORBIDDEN
            );
        }
    }


    async update(req, res, next) {
        try {
            const role =
                await this.getRecord(req);

            this.assertRoleCanBeModified(
                role
            );

            const updatedRole =
                await role.update({
                    ...req.body,
                });

            await updatedRole.reload();

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    'User role updated successfully.',

                data:
                    this.serialize(
                        updatedRole
                    ),
            });
        } catch (error) {
            next(error);
        }
    }


    async delete(req, res, next) {
        try {
            const role =
                await this.getRecord(req);

            this.assertRoleCanBeModified(
                role
            );

            const assignedUsers =
                await User.count({
                    where: {
                        user_role_id:
                            role.id,

                        deleted_at:
                            null,
                    },
                });

            if (assignedUsers > 0) {
                throw new AppException(
                    `This role is assigned to ${assignedUsers} active user${assignedUsers === 1 ? '' : 's'} and cannot be deleted.`,
                    HTTP_STATUS.HTTP_409_CONFLICT,
                    {
                        assigned_users:
                            assignedUsers,
                    }
                );
            }

            await role.destroy();

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    'User role deleted successfully.',
            });
        } catch (error) {
            next(error);
        }
    }


    async setStatus(req, res, next) {
        try {
            const {
                status,
            } = req.body;

            const requestedStatus =
                Boolean(status);

            const role =
                await this.getRecord(req);

            if (
                requestedStatus === false &&
                Number(role.id) ===
                Number(
                    req.user.user_role_id
                )
            ) {
                throw new AppException(
                    'You cannot disable the role assigned to your own account.',
                    HTTP_STATUS.HTTP_403_FORBIDDEN
                );
            }

            if (
                this.isProtectedRole(role) &&
                requestedStatus === false
            ) {
                throw new AppException(
                    'The administrator role cannot be disabled.',
                    HTTP_STATUS.HTTP_403_FORBIDDEN
                );
            }

            const updatedRole =
                await role.update({
                    status:
                        requestedStatus,
                });

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    `User role ${updatedRole.status
                        ? 'enabled'
                        : 'disabled'
                    } successfully.`,

                data:
                    this.serialize(
                        updatedRole
                    ),
            });
        } catch (error) {
            next(error);
        }
    }


    async setRemarks(req, res, next) {
        try {
            const role =
                await this.getRecord(req);

            this.assertRoleCanBeModified(
                role
            );

            const updatedRole =
                await role.update({
                    remarks:
                        req.body.remarks,
                });

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    'User role remarks updated successfully.',

                data:
                    this.serialize(
                        updatedRole
                    ),
            });
        } catch (error) {
            next(error);
        }
    }


    async setTags(req, res, next) {
        try {
            const role =
                await this.getRecord(req);

            this.assertRoleCanBeModified(
                role
            );

            const updatedRole =
                await role.update({
                    tags:
                        req.body.tags,
                });

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    'User role tags updated successfully.',

                data:
                    this.serialize(
                        updatedRole
                    ),
            });
        } catch (error) {
            next(error);
        }
    }


    async removeRemarks(
        req,
        res,
        next
    ) {
        try {
            const role =
                await this.getRecord(req);

            this.assertRoleCanBeModified(
                role
            );

            const updatedRole =
                await role.update({
                    remarks:
                        null,
                });

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    'User role remarks removed successfully.',

                data:
                    this.serialize(
                        updatedRole
                    ),
            });
        } catch (error) {
            next(error);
        }
    }


    async removeTags(
        req,
        res,
        next
    ) {
        try {
            const role =
                await this.getRecord(req);

            this.assertRoleCanBeModified(
                role
            );

            const updatedRole =
                await role.update({
                    tags:
                        [],
                });

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    'User role tags removed successfully.',

                data:
                    this.serialize(
                        updatedRole
                    ),
            });
        } catch (error) {
            next(error);
        }
    }
}


const user_role_controller =
    new UserRoleController();


export default user_role_controller;