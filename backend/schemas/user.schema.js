import { z } from 'zod';
import BaseSchema from './base.schema.js';
import { UserRoleSchema } from './user-role.schema.js';

// user response schema
export const UserSchema = BaseSchema.extend({

    userid: z.string(),

    email: z.string(),

    name: z.string(),

    role: UserRoleSchema.optional(),

});

// user creation schema
export const UserCreateSchema = z.object({

    name: z.string().min(3).max(100),

    email: z.email(),

    userid: z.string().min(3).max(50),

    password: z.string().min(6).max(100),

    confirm_password: z.string().min(6).max(100),

});

// user update schema
export const UserUpdateSchema = z.object({

    name: z.string().min(2).max(100).optional(),

    email: z.email().optional(),

    userid: z.string().min(3).max(50).optional(),


});