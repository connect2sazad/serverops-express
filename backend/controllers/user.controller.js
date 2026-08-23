import bcrypt from 'bcryptjs';

import BaseController from './base.controller.js';
import User from '../models/user.model.js';
import { UserSchema } from '../schemas/user.schema.js';

export class UserController extends BaseController{

    constructor(){
        super(User, UserSchema);
    }

}

const user_controller = new UserController();

export default user_controller;