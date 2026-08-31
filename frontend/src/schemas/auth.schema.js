import { z } from 'zod';

export const loginSchema = z.object({

    userid: z
        .string()
        .min(3, "Username must be at least 3 characters.")
        .max(50, "Username must be at most 50 characters."),
        
    password: z
        .string()
        .min(6, "Password must have at least 6 characters."),

});