import { z } from 'zod';
import BaseSchema from './base.schema.js';
import { UserSchema } from './user.schema.js';
import { InventorySchema } from './inventory.schema.js';

const ServiceNameSchema = z.string()
    .trim()
    .min(1, 'Service name is required.')
    .max(255)
    .regex(
        /^[a-zA-Z0-9@_.:-]+$/,
        'Invalid service name.'
    );

export const ManagedServiceSchema = BaseSchema.extend({
    inventory_id: z.number().int().positive(),
    service_name: z.string(),

    can_restart: z.boolean(),
    can_start: z.boolean(),
    can_stop: z.boolean(),
    can_enable: z.boolean(),
    can_disable: z.boolean(),

    inventory: InventorySchema.optional(),
    creator: UserSchema.optional(),

});

export const ManagedServiceCreateSchema = z.object({
    service_name: ServiceNameSchema,

    can_restart: z.boolean().default(false),
    can_start: z.boolean().default(false),
    can_stop: z.boolean().default(false),
    can_enable: z.boolean().default(false),
    can_disable: z.boolean().default(false),
}).refine(
    data =>
        data.can_restart ||
        data.can_start ||
        data.can_stop ||
        data.can_enable ||
        data.can_disable,
    {
        message: 'At least one service action must be allowed.',
    }
);

export const ManagedServiceUpdateSchema = z.object({
    service_name: ServiceNameSchema.optional(),
    can_restart: z.boolean().optional(),
    can_start: z.boolean().optional(),
    can_stop: z.boolean().optional(),
    can_enable: z.boolean().optional(),
    can_disable: z.boolean().optional(),
}).refine(
    data => Object.keys(data).length > 0,
    {
        message: 'At least one field must be provided.',
    }
);

export const ManagedServiceInventoryParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const ManagedServiceRecordParamsSchema =
    ManagedServiceInventoryParamsSchema.extend({
        managed_service_id: z.coerce
            .number()
            .int()
            .positive(),
    });