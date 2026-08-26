import BaseController from './base.controller.js';
import { User } from '../models/index.js';
import { UserSchema } from '../schemas/user.schema.js';

export class UserController extends BaseController{

    constructor(){

        const settings = {
            schema: UserSchema
        };

        super(User, settings);
    }

}

const user_controller = new UserController();

export default user_controller;