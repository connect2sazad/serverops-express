import {z} from 'zod';

export const ProcessParamsSchema = z.object({

    id: z.coerce.number().int().positive(),

    pid: z.coerce.number().int().min(2, 'PID 1 cannot be managed.'),

});

export const ProcessActionSchema = z.object({

    confirm_pid: z.coerce.number().int().min(2),

    reason: z.string().trim().min(3, 'A reason is required').max(500)

});