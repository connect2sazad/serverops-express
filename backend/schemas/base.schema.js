import { z } from 'zod';

export const JsonStringArraySchema = z.preprocess(
    value => {
        if (typeof value !== 'string') return value;

        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    },
    z.array(z.string()).nullable()
);

const TagsArraySchema = z
    .array(
        z.string()
            .trim()
            .min(1, "Tag cannot be empty.")
            .max(50, "Tag cannot exceed 50 characters.")
    )
    .max(20, "A maximum of 20 tags is allowed.")
    .refine(
        tags =>
            new Set(
                tags.map(tag => tag.toLowerCase())
            ).size === tags.length,
        {
            message: "Duplicate tags are not allowed.",
        }
    );

export const TagsSchema = z.preprocess(
    value => {
        if (typeof value !== "string") {
            return value;
        }

        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    },
    TagsArraySchema
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

export const BaseCreateSchema = z.object({

    tags: TagsSchema.default([]),
    remarks: z.string().trim().max(1000).nullable().optional(),

});

export const BaseUpdateSchema = z.object({

    tags: TagsSchema.optional(),
    remarks: z.string().trim().max(1000).nullable().optional(),

});

export default BaseSchema;