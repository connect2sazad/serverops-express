import express from "express";

import { API_PREFIX } from "./config/config.js";

// import all routers
import healthRouter from './routes/health.route.js'
import usersRouter from './routes/users.route.js';
import authRouter from './routes/auth.route.js';
import userRolesRouter from './routes/user-roles.route.js';
import inventoriesRouter from './routes/inventories.route.js';
import credentialsRouter from './routes/credentials.route.js';
import commandExecutionsRouter from './routes/command-executions.route.js';
import servicesRouter from './routes/services.route.js';
import HTTP_STATUS from "./exceptions/status_codes.js";

const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
        status: true,
        message: 'Working!!'
    });
});

// attach all routers
// health router
router.use(healthRouter);
// auth router
router.use(API_PREFIX, authRouter);
// users router
router.use(API_PREFIX, usersRouter);
// user roles router
router.use(API_PREFIX, userRolesRouter);
// inventories router
router.use(API_PREFIX, inventoriesRouter);
// credentials router
router.use(API_PREFIX, credentialsRouter);
// command Executions router
router.use(API_PREFIX, commandExecutionsRouter);
// services running in invetory router
router.use(API_PREFIX, servicesRouter);

export default router;