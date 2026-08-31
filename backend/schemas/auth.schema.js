import { z } from 'zod';

// login
export const loginSchema = z.object({

    // userid: z.string(3, 'Userid is required'),
    userid: z.string().trim().min(3).max(50),

    // password: z.string().min(6, 'Password is required'),
    password: z.string().min(6).max(100),

});

// register
export const registerSchema = z.object({

    name: z.string().min(3).max(100),

    email: z.email(),

    userid: z.string().min(3).max(50),

    password: z.string().min(6).max(100),

    confirm_password: z.string().min(6).max(100),

    user_role_id: z.number().int(),

}).refine(

    data => data.password === data.confirm_password,

    {

        message: "Password and Confirm Password do not match!",

        path: ['confirm_password']

    }

);

// reset password
export const resetPasswordSchema = z.object({

    password: z.string().min(6).max(100),

    confirm_password: z.string().min(6).max(100),

}).refine(

    data => data.password === data.confirm_password,

    {

        message: "Password and Confirm Password do not match!",

        path: ['confirm_password']

    }

);