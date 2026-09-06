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
    UserSchema,
} from '../schemas/user.schema.js';

import {
    DASHBOARD_WIDGET_VALUES,
    PERMISSIONS,
} from '../config/permissions.js';


const ADMIN_ROLE_SLUGS =
    new Set([
        'admin',
        'administrator',
    ]);


export class UserController
    extends BaseController {

    constructor() {
        const settings = {
            schema:
                UserSchema,

            includes: [
                {
                    model:
                        UserRole,

                    as:
                        'role',
                },
            ],

            searchFields: [
                'name',
                'email',
                'userid',
            ],
        };

        super(
            User,
            settings
        );
    }


    async findUser(id) {
        const user =
            await User.findOne({
                where: {
                    id,

                    deleted_at:
                        null,
                },

                include:
                    this.includes,
            });

        if (!user) {
            throw new AppException(
                'User not found!',
                HTTP_STATUS.HTTP_404_NOT_FOUND
            );
        }

        return user;
    }


    isAdministrator(user) {
        return ADMIN_ROLE_SLUGS.has(
            user.role?.slug
        );
    }


    async countActiveAdministrators() {
        return User.count({
            where: {
                status:
                    true,

                deleted_at:
                    null,
            },

            include: [
                {
                    model:
                        UserRole,

                    as:
                        'role',

                    required:
                        true,

                    where: {
                        slug: [
                            ...ADMIN_ROLE_SLUGS,
                        ],
                    },
                },
            ],

            distinct:
                true,
        });
    }


    async assertNotLastAdministrator(
        user
    ) {
        if (
            !this.isAdministrator(user) ||
            !user.status
        ) {
            return;
        }

        const administratorCount =
            await this
                .countActiveAdministrators();

        if (
            administratorCount <= 1
        ) {
            throw new AppException(
                'The final active administrator account cannot be disabled, deleted, or moved to another role.',
                HTTP_STATUS.HTTP_409_CONFLICT
            );
        }
    }


    async self(req, res, next) {
        try {
            const user =
                await this.findUser(
                    req.auth.id
                );

            const userData =
                this.serialize(
                    user,
                    UserSchema
                );

            const permissions =
                Array.isArray(
                    req.auth.permissions
                )
                    ? req.auth.permissions
                    : [];

            const dashboardWidgets =
                DASHBOARD_WIDGET_VALUES
                    .filter(
                        widget =>
                            permissions.includes(
                                PERMISSIONS.ALL
                            ) ||
                            widget
                                .required_permissions
                                .every(
                                    permission =>
                                        permissions.includes(
                                            permission
                                        )
                                )
                    )
                    .map(
                        ({
                            key,
                            title,
                        }) => ({
                            key,
                            title,
                        })
                    );

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                status: true,

                message:
                    'User details fetched successfully.',

                data: {
                    ...userData,

                    permissions,

                    dashboard_widgets:
                        dashboardWidgets,
                },
            });
        } catch (error) {
            next(error);
        }
    }


    async update(req, res, next) {
        try {
            const targetUser =
                await this.findUser(
                    req.params.id
                );

            const authenticatedUserId =
                Number(req.auth.id);

            const targetUserId =
                Number(targetUser.id);

            const data = {
                ...req.body,
            };

            if (
                data.user_role_id !==
                undefined
            ) {
                const newRoleId =
                    Number(
                        data.user_role_id
                    );

                if (
                    targetUserId ===
                        authenticatedUserId &&
                    newRoleId !==
                        Number(
                            targetUser
                                .user_role_id
                        )
                ) {
                    throw new AppException(
                        'You cannot change your own user role.',
                        HTTP_STATUS.HTTP_403_FORBIDDEN
                    );
                }

                const newRole =
                    await UserRole.findOne({
                        where: {
                            id:
                                newRoleId,

                            deleted_at:
                                null,
                        },
                    });

                if (!newRole) {
                    throw new AppException(
                        'Selected user role was not found.',
                        HTTP_STATUS.HTTP_422_UNPROCESSABLE_ENTITY
                    );
                }

                if (!newRole.status) {
                    throw new AppException(
                        'An inactive user role cannot be assigned.',
                        HTTP_STATUS.HTTP_422_UNPROCESSABLE_ENTITY
                    );
                }

                const movingFromAdministrator =
                    this.isAdministrator(
                        targetUser
                    ) &&
                    !ADMIN_ROLE_SLUGS.has(
                        newRole.slug
                    );

                if (
                    movingFromAdministrator
                ) {
                    await this
                        .assertNotLastAdministrator(
                            targetUser
                        );
                }
            }

            const updatedUser =
                await targetUser.update(
                    data
                );

            await updatedUser.reload({
                include:
                    this.includes,
            });

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    'User updated successfully.',

                data:
                    this.serialize(
                        updatedUser
                    ),
            });
        } catch (error) {
            next(error);
        }
    }


    async updatePermissions(
        req,
        res,
        next
    ) {
        try {
            const targetUser =
                await this.findUser(
                    req.params.id
                );

            const {
                individual_permissions,
            } = req.body;

            const updatedUser =
                await targetUser.update({
                    individual_permissions,
                });

            await updatedUser.reload({
                include:
                    this.includes,
            });

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    'Individual user permissions updated successfully.',

                data:
                    this.serialize(
                        updatedUser
                    ),
            });
        } catch (error) {
            next(error);
        }
    }


    async setStatus(req, res, next) {
        try {
            const targetUser =
                await this.findUser(
                    req.params.id
                );

            const requestedStatus =
                Boolean(
                    req.body.status
                );

            if (
                Number(targetUser.id) ===
                    Number(req.auth.id) &&
                requestedStatus === false
            ) {
                throw new AppException(
                    'You cannot disable your own account.',
                    HTTP_STATUS.HTTP_403_FORBIDDEN
                );
            }

            if (
                requestedStatus === false
            ) {
                await this
                    .assertNotLastAdministrator(
                        targetUser
                    );
            }

            const updatedUser =
                await targetUser.update({
                    status:
                        requestedStatus,
                });

            await updatedUser.reload({
                include:
                    this.includes,
            });

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    `User ${
                        updatedUser.status
                            ? 'enabled'
                            : 'disabled'
                    } successfully.`,

                data:
                    this.serialize(
                        updatedUser
                    ),
            });
        } catch (error) {
            next(error);
        }
    }


    async delete(req, res, next) {
        try {
            const targetUser =
                await this.findUser(
                    req.params.id
                );

            if (
                Number(targetUser.id) ===
                Number(req.auth.id)
            ) {
                throw new AppException(
                    'You cannot delete your own account.',
                    HTTP_STATUS.HTTP_403_FORBIDDEN
                );
            }

            await this
                .assertNotLastAdministrator(
                    targetUser
                );

            await targetUser.destroy();

            return res.status(
                HTTP_STATUS.HTTP_200_OK
                    .status_code
            ).json({
                success: true,

                message:
                    'User deleted successfully.',
            });
        } catch (error) {
            next(error);
        }
    }
}


const user_controller =
    new UserController();


export default user_controller;