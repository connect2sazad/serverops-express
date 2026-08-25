import { z } from 'zod';
import BaseSchema from './base.schema.js';

// Inventory response schema
export const InventorySchema = BaseSchema.extend({

    name: z.string(),
    hostname: z.string(),
    ssh_port: z.number().int(),
    ssh_username: z.string(),
    environment: z.string(),
    operating_system: z.string(),
    description: z.string(),
    connection_status: z.string(),
    last_connected_at: z.coerce.date(),
    creator_id: z.number().int(),

});

// Inventory creation schema
export const InventoryCreateSchema = z.object({

    name: z.string().min(3).max(100).optional(),
    hostname: z.string().min(1).max(100),
    ssh_port: z.number().int().min(1).max(65535).default(22),
    ssh_username: z.string().min(1).max(100),
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
    ssh_username: z.string().min(1).max(100).optional(),
    environment: z.string().min(1).max(100).optional(),
    operating_system: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    
});