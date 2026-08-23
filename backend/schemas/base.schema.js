import { z } from 'zod';

const BaseSchema = z.object({

    id: z.number(),

    remarks: z.string().nullable(),

    tags: z.json().nullable(),

    status: z.boolean(),

    created_at: z.coerce.date(),

    updated_at: z.coerce.date(),
    
    deleted_at: z.coerce.date().nullable(),

});

export default BaseSchema;