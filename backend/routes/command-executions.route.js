import express from 'express';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorize.middleware.js';
import command_controller from '../controllers/command-execution.controller.js';

const router = express.Router();
const PREFIX = '/command-executions';

// string routes
const COMMANDEXECUTIONS = PREFIX;
const COMMANDEXECUTION_ID = PREFIX + '/:id';

// get all inventories
router.get(COMMANDEXECUTIONS, authenticate, authorizeRoles('admin'), async (req, res, next) => {

  await command_controller.get(req, res, next);

});

// get a single inventory details by id
router.get(COMMANDEXECUTION_ID, authenticate, authorizeRoles('admin'), async (req, res, next) => {

  await command_controller.get(req, res, next);

});

export default router;