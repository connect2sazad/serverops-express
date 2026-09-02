import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { INVENTORY_ID } from './inventories.route.js';
import service_controller from '../controllers/service.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { authorizePermissions } from '../middlewares/authorize.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';
import { ServiceParamsSchema } from '../schemas/service.schema.js';

const router = express.Router();
const PREFIX = INVENTORY_ID + '/services';

// services
const SERVICES = PREFIX;
const SERVICE_NAME = PREFIX + '/:service';
const SERVICE_START = PREFIX + '/:service/start';
const SERVICE_RESTART = PREFIX + '/:service/restart';
const SERVICE_STOP = PREFIX + '/:service/stop';
const SERVICE_ENABLE = PREFIX + '/:service/enable';
const SERVICE_DISABLE = PREFIX + '/:service/disable';

// get all services
router.get(SERVICES, authenticate, authorizePermissions(PERMISSIONS.SERVICES_LIST), async (req, res, next) => {

  await service_controller.getAll(req, res, next);

});

// get a single services details by id
router.get(SERVICE_NAME, authenticate, authorizePermissions(PERMISSIONS.SERVICES_READ), validate(ServiceParamsSchema, 'params'), async (req, res, next) => {

  await service_controller.get(req, res, next);

});

// start service
router.post(SERVICE_START, authenticate, authorizePermissions(PERMISSIONS.SERVICES_START), validate(ServiceParamsSchema, 'params'), async (req, res, next) => {

  await service_controller.service_action(req, res, next, 'start');

});

// restart service
router.post(SERVICE_RESTART, authenticate, authorizePermissions(PERMISSIONS.SERVICES_RESTART), validate(ServiceParamsSchema, 'params'), async (req, res, next) => {

  await service_controller.service_action(req, res, next, 'restart');

});

// stop service
router.post(SERVICE_STOP, authenticate, authorizePermissions(PERMISSIONS.SERVICES_STOP), validate(ServiceParamsSchema, 'params'), async (req, res, next) => {

  await service_controller.service_action(req, res, next, 'stop');

});

// enable service
router.post(SERVICE_ENABLE, authenticate, authorizePermissions(PERMISSIONS.SERVICES_ENABLE), validate(ServiceParamsSchema, 'params'), async (req, res, next) => {

  await service_controller.service_action(req, res, next, 'enable');

});

// disable service
router.post(SERVICE_DISABLE, authenticate, authorizePermissions(PERMISSIONS.SERVICES_DISABLE), validate(ServiceParamsSchema, 'params'), async (req, res, next) => {

  await service_controller.service_action(req, res, next, 'disable');

});


export default router;