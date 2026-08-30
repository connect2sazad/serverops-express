import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { INVENTORY_ID } from './inventories.route.js';
import process_controller from '../controllers/process.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { ProcessParamsSchema } from '../schemas/process.schema.js';

const router = express.Router();
const PREFIX = INVENTORY_ID + '/processes';

// processes
const PROCESSES = PREFIX;
const PROCESS_ID = PREFIX + '/:pid';
const PROCESS_ID_KILL = PREFIX + '/:pid/kill';
const PROCESS_ID_TERMINATE = PREFIX + '/:pid/terminate';

// get all processes
router.get(PROCESSES, authenticate, async (req, res, next) => {

  await process_controller.getAll(req, res, next);

});

// get a single process details by id
router.get(PROCESS_ID, authenticate, validate(ProcessParamsSchema, 'params'), async (req, res, next) => {

  await process_controller.get(req, res, next);

});

// terminate a process by id
router.post(PROCESS_ID_TERMINATE, authenticate, validate(ProcessParamsSchema, 'params'), async (req, res, next) => {

  await process_controller.terminateProcess(req, res, next, 'terminate');

});

// force kill a process by id
router.post(PROCESS_ID_KILL, authenticate, validate(ProcessParamsSchema, 'params'), async (req, res, next) => {

  await process_controller.terminateProcess(req, res, next, 'force_kill');

});



export default router;