import { z } from 'zod';
import BaseSchema from './base.schema.js';
import { UserSchema } from './user.schema.js';
import { InventorySchema } from './inventory.schema.js';

// Credential response schema
export const CredentialSchema = BaseSchema.extend({

    username: z.string(),
    type: z.enum(['password', 'private-key']),
    passphrase: z.string().nullable().transform(
        value => value != null // boolean true if passphrase is found, else false
    ),
    inventory: InventorySchema.optional(),
    creator: UserSchema.optional(),

});

// Credential creation schema
export const CredentialCreateSchema = z.object({

    inventory_id: z.coerce.number().int(),
    username: z.string().min(1).max(100),
    type: z.enum(['password', 'private-key']).default('password'),
    secret: z.string().optional(),
    passphrase: z.string().nullable().optional(),
    
}).superRefine((data, ctx) => {

    if(data.type === 'password' && !data.secret) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['secret'],
            message: "Secret is required for password credentials."
        });
    }

});

// Credential update schema
export const CredentialUpdateSchema = z.object({

    inventory_id: z.coerce.number().int().optional(),
    username: z.string().min(1).max(100).optional(),
    type: z.enum(['password', 'private-key']).optional(),
    secret: z.string().min(1).optional(),
    passphrase: z.string().nullable().optional(),
    
});