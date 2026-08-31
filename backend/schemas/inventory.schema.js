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

});

// Inventory creation schema
export const InventoryCreateSchema = z.object({

    name: z.string().trim().min(3).max(100),
    hostname: z.string().min(1).max(100),
    ssh_port: z.number().int().min(1).max(65535).default(22),
    environment: z.string().min(1).max(100),
    operating_system: z.string().min(1).max(100),
    description: z.string().optional(),
    connection_status: z.enum(['connected','disconnected','unknown']).default('unknown'),
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