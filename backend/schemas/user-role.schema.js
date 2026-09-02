import { z } from 'zod';
import BaseSchema from './base.schema.js';
import { PERMISSION_VALUES } from '../config/permissions.js';

export const PermissionSchema = z.enum(PERMISSION_VALUES);

export const PermissionArraySchema = z.preprocess(
    value => {
        if(typeof value !== 'string') return value;

        try{
            return JSON.parse(value);
        } catch {
            return value;
        }
    },
    z.array(PermissionSchema)
        .max(PERMISSION_VALUES.length)
        .refine(
            permissions => new Set(permissions).size === permissions.length,
            {
                message: 'Duplicate permissions are not allowed.',
            }
        )
);

export const PermissionResponseSchema = z.preprocess(
    value => value ?? [],
    PermissionArraySchema
);

const RoleNameSchema = z.string().trim().min(3).max(50);

const RoleSlugSchema = z.string().trim().min(3).max(50)
    .regex(
        /^[a-z0-9-]+$/,
        'Role slug may contain lowercase letters, numbers, and hyphens only.'
    );

export const UserRoleSchema = BaseSchema.extend({

    name: z.string(),

    slug: z.string(),

    permissions: PermissionResponseSchema,

});

// user role creation schema
export const UserRoleCreateSchema = z.object({

    name: z.string().min(3).max(50),

    slug: z.string().min(3).max(50),

    permissions: PermissionArraySchema.default([]),

});

// user role update schema
export const UserRoleUpdateSchema = z.object({

    name: z.string().min(3).max(50).optional(),

    slug: z.string().min(3).max(50).optional(),

    permissions: PermissionArraySchema.optional(),

}).refine(
    data => Object.keys(data).length > 0,
    {
        message: 'At least one field must be provided.'
    }
);