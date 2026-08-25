import express from 'express';

import { requestUUID } from './middlewares/uuid.middleware.js';
import CORS_POLICY from './middlewares/cors.middleware.js';
import errorHandler from './middlewares/error.middleware.js';

import rootRouter from './root.js';

// create instance of express
const app = express();

// use cors and allow allowed origins from environment
app.use(CORS_POLICY);

// use express as middleware
app.use(express.json())

// use middleware to add request ids for each request
app.use(requestUUID);

// register root router
app.use('/', rootRouter);

// global error handler
app.use(errorHandler);

export default app;