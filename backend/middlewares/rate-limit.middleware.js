import { rateLimit } from 'express-rate-limit';

import { LOGIN_LIMIT } from '../config/config.js';

export const loginLimiter = rateLimit({

    windowMs: 15*60*1000,
    limit: LOGIN_LIMIT,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        code: 'LOGIN_RATE_LIMITED',
        message: 'Too many login attempts. Please try again later!',
    }

});