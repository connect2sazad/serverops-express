import BaseController from "./base.controller.js";
import { UserRole } from '../models/index.js';
import { UserRoleCreateSchema, UserRoleSchema, UserRoleUpdateSchema } from "../schemas/user-role.schema.js";

export class UserRoleController extends BaseController{

    constructor(){

        const settings = {
            schema: UserRoleSchema,
            createSchema: UserRoleCreateSchema,
            updateSchema: UserRoleUpdateSchema,
        }

        super(UserRole, settings);
    }

}

const user_role_controller = new UserRoleController();

export default user_role_controller;