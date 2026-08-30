import {z} from 'zod';

export const ProcessParamsSchema = z.object({

    id: z.coerce.number().int().positive(),

    pid: z.coerce.number().int().positive(),

});