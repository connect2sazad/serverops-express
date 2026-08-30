import {z} from 'zod';

export const ServiceParamsSchema = z.object({

    id: z.coerce.number().int().positive(),

    service: z.string().min(1).max(255).regex(
        /^[a-zA-Z0-9@_.:-]+$/,
        'Invalid Service Name'
    ),

});