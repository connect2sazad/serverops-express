import cors from 'cors';
import express from 'express';

import { ALLOWED_ORIGINS, API_DOCS_ENABLE } from './config/config.js';
import AppException from './exceptions/exception.js';
import HTTP_STATUS from './exceptions/status_codes.js';
import { requestUUID } from './middlewares/uuid.middleware.js';

import rootRouter from './root.js';

// create instance of express
const app = express();

// extract Allowed Origins from environment using config
const allowedOrigins = ALLOWED_ORIGINS
    .split(',')
    .map((origin) => origin.trim());

// use cors
app.use(
    cors({
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
    })
)

// use express as middleware
app.use(express.json())

// use middleware to add request ids for each request
app.use(requestUUID);

// register root router
app.use('/', rootRouter);

export default app;