import cors from 'cors';

import { ALLOWED_ORIGINS } from '../config/config.js';

const allowedOrigins = ALLOWED_ORIGINS
    .split(',')
    .map((origin) => origin.trim());

const CORS_POLICY = cors({
    origin: (origin, callback) => {

        // allow requests without header, eg: Postman
        if (!origin) {
            return callback(null, true);
        }

        // allow origins registered in environment
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // return exception for unauthorized cors
        return callback(new AppException('Not allowed by CORS', HTTP_STATUS.HTTP_400_BAD_REQUEST))
    }
});

export default CORS_POLICY;