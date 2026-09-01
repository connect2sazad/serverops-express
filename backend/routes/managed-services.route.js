import express from 'express';

import { INVENTORY_ID } from './inventories.route.js';

import managed_service_controller
    from '../controllers/managed-service.controller.js';

import { authenticate }
    from '../middlewares/auth.middleware.js';

import { authorizeRoles }
    from '../middlewares/authorize.middleware.js';

import validate
    from '../middlewares/validate.middleware.js';

import {
    ManagedServiceCreateSchema,
    ManagedServiceUpdateSchema,
    ManagedServiceInventoryParamsSchema,
    ManagedServiceRecordParamsSchema,
} from '../schemas/managed-service.schema.js';

const router = express.Router();

const MANAGED_SERVICES =
    INVENTORY_ID + '/managed-services';

const MANAGED_SERVICE_ID =
    MANAGED_SERVICES + '/:managed_service_id';

router.get(
    MANAGED_SERVICES,
    authenticate,
    authorizeRoles('admin'),
    validate(ManagedServiceInventoryParamsSchema, 'params'),
    async (req, res, next) => {
        await managed_service_controller.getAll(
            req,
            res,
            next
        );
    }
);

router.get(
    MANAGED_SERVICE_ID,
    authenticate,
    authorizeRoles('admin'),
    validate(ManagedServiceRecordParamsSchema, 'params'),
    async (req, res, next) => {
        await managed_service_controller.getOne(
            req,
            res,
            next
        );
    }
);

router.post(
    MANAGED_SERVICES,
    authenticate,
    authorizeRoles('admin'),
    validate(ManagedServiceInventoryParamsSchema, 'params'),
    validate(ManagedServiceCreateSchema),
    async (req, res, next) => {
        await managed_service_controller.create(
            req,
            res,
            next
        );
    }
);

router.put(
    MANAGED_SERVICE_ID,
    authenticate,
    authorizeRoles('admin'),
    validate(ManagedServiceRecordParamsSchema, 'params'),
    validate(ManagedServiceUpdateSchema),
    async (req, res, next) => {
        await managed_service_controller.update(
            req,
            res,
            next
        );
    }
);

router.delete(
    MANAGED_SERVICE_ID,
    authenticate,
    authorizeRoles('admin'),
    validate(ManagedServiceRecordParamsSchema, 'params'),
    async (req, res, next) => {
        await managed_service_controller.delete(
            req,
            res,
            next
        );
    }
);

export default router;