import BaseController from './base.controller.js';
import { User, UserRole } from '../models/index.js';
import { UserSchema } from '../schemas/user.schema.js';
import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';

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

            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                status: true,
                message: `User details fetched successfully.`,
                data: this.serialize(user, UserSchema),
            });


        } catch (e) {
            next(e);
        }
    }

}

const user_controller = new UserController();

export default user_controller;