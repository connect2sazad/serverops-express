import express from "express";

import { API_PREFIX } from "./config/config.js";

// import all routers
import healthRouter from './routes/health.route.js'
import usersRouter from './routes/users.route.js';
import authRouter from './routes/auth.route.js';

const router = express.Router();

// attach all routers
// health router
router.use(healthRouter);
// auth router
router.use(API_PREFIX, authRouter);
// users router
router.use(API_PREFIX, usersRouter);

export default router;