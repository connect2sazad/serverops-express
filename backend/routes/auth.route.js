import express from 'express';

import auth_controller from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorize.middleware.js';
import { loginLimiter } from '../middlewares/rate-limit.middleware.js';

const router = express.Router();
const PREFIX = '/auth';

// string routes
const LOGIN = PREFIX + '/login';
const REGISTER = PREFIX + '/register';
const LOGOUT = PREFIX + '/logout';

// register a user
router.post(REGISTER, authenticate, authorizeRoles('admin'), validate(registerSchema), async (req, res, next) => {
 
  await auth_controller.register(req, res, next);

});

// login
router.post(PREFIX, loginLimiter, validate(loginSchema), async (req, res, next) => {
 
  await auth_controller.login(req, res, next);

});
router.post(LOGIN, loginLimiter, validate(loginSchema), async (req, res, next) => {
 
  await auth_controller.login(req, res, next);

});

router.post(LOGOUT, authenticate, async (req, res, next) => {

  await auth_controller.logout(req, res, next);

});

export default router;