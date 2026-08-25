import { z } from 'zod';
import BaseSchema from './base.schema.js';

export const UserRoleSchema = BaseSchema.extend({

    name: z.string(),

    slug: z.string(),

    permissions: z.json(),

});

// user role creation schema
export const UserRoleCreateSchema = z.object({

    name: z.string().min(3).max(50),

    slug: z.string().min(3).max(50),

    permissions: z.json(),

});

// user role update schema
export const UserRoleUpdateSchema = z.object({

    name: z.string().min(3).max(50).optional(),

    slug: z.string().min(3).max(50).optional(),

    permissions: z.json().optional(),

});