import { z } from 'zod';

import BaseSchema, {
    BaseCreateSchema,
    BaseUpdateSchema,
} from './base.schema.js';

import {
    PERMISSION_VALUES,
} from '../config/permissions.js';


export const PermissionSchema = z.enum(
    PERMISSION_VALUES
);


export const PermissionArraySchema = z.preprocess(
    value => {
        if (typeof value !== 'string') {
            return value;
        }

        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    },

    z.array(PermissionSchema)
        .max(
            PERMISSION_VALUES.length,
            'Too many permissions were provided.'
        )
        .refine(
            permissions =>
                new Set(permissions).size ===
                permissions.length,
            {
                message:
                    'Duplicate permissions are not allowed.',
            }
        )
);


export const PermissionResponseSchema = z.preprocess(
    value => value ?? [],
    PermissionArraySchema
);


const RoleNameSchema = z.string()
    .trim()
    .min(
        3,
        'Role name must contain at least 3 characters.'
    )
    .max(
        50,
        'Role name cannot exceed 50 characters.'
    );


const RoleSlugSchema = z.string()
    .trim()
    .min(
        3,
        'Role slug must contain at least 3 characters.'
    )
    .max(
        50,
        'Role slug cannot exceed 50 characters.'
    )
    .regex(
        /^[a-z0-9-]+$/,
        'Role slug may contain lowercase letters, numbers, and hyphens only.'
    );


export const UserRoleSchema = BaseSchema.extend({
    name: z.string(),

    slug: z.string(),

    permissions: PermissionResponseSchema,
});


// User role creation schema
export const UserRoleCreateSchema =
    BaseCreateSchema.extend({
        name: RoleNameSchema,

        slug: RoleSlugSchema,

        permissions:
            PermissionArraySchema.default([]),
    });


// User role update schema
export const UserRoleUpdateSchema =
    BaseUpdateSchema.extend({
        name: RoleNameSchema.optional(),

        slug: RoleSlugSchema.optional(),

        permissions:
            PermissionArraySchema.optional(),
    }).refine(
        data => Object.keys(data).length > 0,
        {
            message:
                'At least one field must be provided.',
        }
    );