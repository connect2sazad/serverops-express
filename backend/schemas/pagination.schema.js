import { z } from 'zod';

export const PaginationSchema = z.object({

    page: z.coerce.number()
        .int()
        .min(1)
        .default(1),

    page_size: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(10),

});