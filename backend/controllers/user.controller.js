import BaseController from './base.controller.js';
import { User, UserRole } from '../models/index.js';
import { UserSchema } from '../schemas/user.schema.js';

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


}

const user_controller = new UserController();

export default user_controller;