import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { INVENTORY_ID } from './inventories.route.js';
import process_controller from '../controllers/process.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { authorizePermissions } from '../middlewares/authorize.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';
import { ProcessParamsSchema } from '../schemas/process.schema.js';

const router = express.Router();
const PREFIX = INVENTORY_ID + '/processes';

// processes
const PROCESSES = PREFIX;
const PROCESS_ID = PREFIX + '/:pid';
const PROCESS_ID_TERMINATE = PREFIX + '/:pid/terminate';
const PROCESS_ID_KILL = PREFIX + '/:pid/kill';

// get all processes
router.get(PROCESSES, authenticate, authorizePermissions(PERMISSIONS.PROCESSES_LIST), async (req, res, next) => {

  await process_controller.getAll(req, res, next);

});

// get a single process details by id
router.get(PROCESS_ID, authenticate, authorizePermissions(PERMISSIONS.PROCESSES_READ), validate(ProcessParamsSchema, 'params'), async (req, res, next) => {

  await process_controller.get(req, res, next);

});

// terminate a process
router.post(PROCESS_ID_TERMINATE, authenticate, authorizePermissions(PERMISSIONS.PROCESSES_TERMINATE), validate(ProcessParamsSchema, 'params'), async (req, res, next) => {

  await process_controller.terminateProcess(req, res, next, 'terminate');

});

// kill a process
router.post(PROCESS_ID_KILL, authenticate, authorizePermissions(PERMISSIONS.PROCESSES_KILL), validate(ProcessParamsSchema, 'params'), async (req, res, next) => {

  await process_controller.terminateProcess(req, res, next, 'force_kill');

});



export default router;