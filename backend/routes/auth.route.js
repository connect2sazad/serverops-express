import express from 'express';

import auth_controller from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { registerSchema } from '../schemas/auth.schema.js';

const router = express.Router();
const PREFIX = '/auth';

// string routes
const REGISTER = PREFIX + '/register';
const LOGIN = PREFIX + '/login';

// register a user
router.post(REGISTER, validate(registerSchema), async (req, res, next) => {
 
  await auth_controller.register(req, res, next);

});

// login
router.post(LOGIN, async (req, res, next) => {
 
  await auth_controller.login(req, res, next);

});

export default router;