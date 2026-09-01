import { z } from 'zod';

export const JsonStringArraySchema = z.preprocess(
    value => {
        if(typeof value !== 'string') return value;

        try{
            return JSON.parse(value);
        } catch {
            return value;
        }
    },
    z.array(z.string()).nullable()
);

const BaseSchema = z.object({

    id: z.number(),

    remarks: z.string().nullable(),

    tags: JsonStringArraySchema,

    status: z.boolean(),

    created_at: z.coerce.date(),

    updated_at: z.coerce.date(),
    
    deleted_at: z.coerce.date().nullable(),

});

export default BaseSchema;