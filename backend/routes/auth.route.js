import express from 'express';

import auth_controller from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { registerSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();
const PREFIX = '/auth';

// string routes
const REGISTER = PREFIX + '/register';
const LOGIN = PREFIX + '/login';
const LOGOUT = PREFIX + '/logout';

// register a user
router.post(REGISTER, authenticate, validate(registerSchema), async (req, res, next) => {
 
  await auth_controller.register(req, res, next);

});

// login
router.post(LOGIN, async (req, res, next) => {
 
  await auth_controller.login(req, res, next);

});

router.post(LOGOUT, authenticate, async (req, res, next) => {

  await auth_controller.logout(req, res, next);

});

export default router;