import { z } from 'zod';

// Command execution schema
export const CommandExecutionSchema = z.object({

    command: z.string().trim().min(1),

});