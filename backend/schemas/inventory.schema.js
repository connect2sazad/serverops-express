import { z } from 'zod';
import BaseSchema from './base.schema.js';
import { UserSchema } from './user.schema.js';

// Inventory response schema
export const InventorySchema = BaseSchema.extend({

    name: z.string(),
    hostname: z.string(),
    ssh_port: z.number().int(),
    environment: z.string(),
    operating_system: z.string().nullable(),
    description: z.string().nullable(),
    connection_status: z.string(),
    last_connected_at: z.coerce.date().nullable(),
    creator: UserSchema.optional(),

    discovered_hostname: z.string().nullable(),
    os_name: z.string().nullable(),
    os_version: z.string().nullable(),
    os_version_id: z.string().nullable(),
    kernel: z.string().nullable(),
    architecture: z.string().nullable(),

    cpu_cores: z.number().int().nullable(),

    memory_total_kib: z.coerce
        .number()
        .int()
        .nonnegative()
        .nullable(),

    uptime_seconds: z.coerce
        .number()
        .int()
        .nonnegative()
        .nullable(),

    inventory_collected_at: z.coerce
        .date()
        .nullable(),

    inventory_partial: z.boolean().nullable(),

    inventory_missing_fields: z
        .array(z.string())
        .nullable(),

});

// Inventory creation schema
export const InventoryCreateSchema = z.object({

    name: z.string().trim().min(3).max(100),
    hostname: z.string().min(1).max(100),
    ssh_port: z.number().int().min(1).max(65535).default(22),
    environment: z.string().min(1).max(100),
    operating_system: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    connection_status: z.enum(['connected', 'disconnected', 'unknown']).default('unknown'),
    last_connected_at: z.coerce.date().nullable().default(null),
});

// Inventory update schema
export const InventoryUpdateSchema = z.object({

    name: z.string().min(3).max(100).optional(),
    hostname: z.string().min(1).max(100).optional(),
    ssh_port: z.number().int().min(1).max(65535).optional(),
    environment: z.string().min(1).max(100).optional(),
    operating_system: z.string().min(1).max(100).optional(),
    description: z.string().optional(),

});