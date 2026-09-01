import { z } from 'zod';

import BaseSchema from './base.schema.js';
import { InventorySchema } from './inventory.schema.js';
import { UserSchema } from './user.schema.js';

const CommandNameSchema = z.string()
    .trim()
    .min(3, 'Command name must contain at least 3 characters.')
    .max(100);

const CommandTextSchema = z.string()
    .trim()
    .min(1, 'Command is required.')
    .max(10000, 'Command is too long.')
    .refine(
        command => !command.includes('\0'),
        'Command contains an invalid null character.'
    );

export const ManagedCommandSchema =
    BaseSchema.extend({
        inventory_id: z.number()
            .int()
            .positive(),

        name: z.string(),

        description: z.string()
            .nullable(),

        command: z.string(),

        timeout_seconds: z.number()
            .int()
            .positive(),
        
        inventory: InventorySchema.optional(),
        creator: UserSchema.optional(),
    });

export const ManagedCommandCreateSchema =
    z.object({
        name: CommandNameSchema,

        description: z.string()
            .trim()
            .max(1000)
            .nullable()
            .optional(),

        command: CommandTextSchema,

        timeout_seconds: z.coerce
            .number()
            .int()
            .min(1)
            .max(300)
            .default(30),
    });

export const ManagedCommandUpdateSchema =
    z.object({
        name: CommandNameSchema.optional(),

        description: z.string()
            .trim()
            .max(1000)
            .nullable()
            .optional(),

        command: CommandTextSchema.optional(),

        timeout_seconds: z.coerce
            .number()
            .int()
            .min(1)
            .max(300)
            .optional(),
    }).refine(
        data => Object.keys(data).length > 0,
        {
            message:
                'At least one field must be provided.',
        }
    );

export const ManagedCommandInventoryParamsSchema =
    z.object({
        id: z.coerce
            .number()
            .int()
            .positive(),
    });

export const ManagedCommandRecordParamsSchema =
    ManagedCommandInventoryParamsSchema.extend({
        managed_command_id: z.coerce
            .number()
            .int()
            .positive(),
    });

export const ManagedCommandExecuteParamsSchema =
    ManagedCommandRecordParamsSchema;