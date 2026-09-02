import BaseController from './base.controller.js';
import { User, UserRole } from '../models/index.js';
import { UserSchema } from '../schemas/user.schema.js';
import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import { DASHBOARD_WIDGET_VALUES, PERMISSIONS } from '../config/permissions.js';

export class UserController extends BaseController {

    constructor() {

        const settings = {
            schema: UserSchema,
            includes: [
                {
                    model: UserRole,
                    as: 'role',
                }
            ],

        };

        super(User, settings);
    }

    async self(req, res, next) {
        try {

            const { id } = req.auth;

            const user = await User.findByPk(id, {
                include: [
                    {
                        model: UserRole,
                        as: 'role',
                    }
                ]
            });

            if (!user) {
                throw new AppException(
                    `User not found!`,
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            const user_data = this.serialize(user, UserSchema);

            const permissions = req.auth.permissions;

            // dashboard widgets
            const dashboard_widgets = DASHBOARD_WIDGET_VALUES.filter(
                widget => permissions.includes(PERMISSIONS.ALL) || widget.required_permissions.every(
                    permission => permissions.includes(permission)
                )
            ).map(({key, title}) => ({
                key, title,
            }));

            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                status: true,
                message: `User details fetched successfully.`,
                data: {
                    ...user_data,
                    permissions,
                    dashboard_widgets
                },
            });


        } catch (e) {
            next(e);
        }
    }

    async updatePermissions(req, res, next) {

        try {

            const { id } = req.params;
            const { individual_permissions } = req.body;

            const user = await User.findByPk(id);

            if (!user) {
                throw new AppException(
                    `User not found!`,
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            await user.update({
                individual_permissions,
            });

            await user.reload({
                include: this.includes
            });

            return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                status: true,
                message: 'Individual User Permissions updated successfully!',
                data: this.serialize(user),
            });

        } catch (e) {

            next(e);

        }

    }

}

const user_controller = new UserController();

export default user_controller;