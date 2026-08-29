import { z } from 'zod';

import BaseSchema from './base.schema.js';
import {InventorySchema} from './inventory.schema.js';
import {CredentialSchema} from './credential.schema.js';
import {UserSchema} from './user.schema.js';

// Command execution schema
export const CommandExecutionSchema = z.object({

    command: z.string().trim().min(1),

});

// Command execution schema view
export const CommandExecutionResponseSchema = BaseSchema.extend({
    inventory_id: z.number().int(),
    credential_id: z.number().int(),
    creator_id: z.number().int(),

    command: z.string().trim().min(1),

    stdout: z.string().nullable(),
    stderr: z.string().nullable(),

    exit_code: z.coerce.number().int().nullable().optional(),

    command_status: z.enum(['success', 'failed', 'timeout']),

    duration: z.number().int(),

    started_at: z.coerce.date(),
    finished_at: z.coerce.date(),

    remarks: z.string().nullable().optional(),
    tags: z.json().nullable().optional(),

    inventory: InventorySchema.optional(),
    credential: CredentialSchema.optional(),
    creator: UserSchema.optional(),
});
