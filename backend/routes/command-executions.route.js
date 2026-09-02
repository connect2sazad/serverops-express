import express from 'express';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizePermissions } from '../middlewares/authorize.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';
import command_controller from '../controllers/command-execution.controller.js';

const router = express.Router();
const PREFIX = '/command-executions';

// string routes
const COMMANDEXECUTIONS = PREFIX;
const COMMANDEXECUTION_ID = PREFIX + '/:id';

// get all inventories
router.get(COMMANDEXECUTIONS, authenticate, authorizePermissions(PERMISSIONS.COMMAND_EXECUTIONS_LIST), async (req, res, next) => {

  await command_controller.get(req, res, next);

});

// get a single inventory details by id
router.get(COMMANDEXECUTION_ID, authenticate, authorizePermissions(PERMISSIONS.COMMAND_EXECUTIONS_READ), async (req, res, next) => {

  await command_controller.get(req, res, next);

});

export default router;