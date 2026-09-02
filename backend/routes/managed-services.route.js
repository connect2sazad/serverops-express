import express from 'express';

import { INVENTORY_ID } from './inventories.route.js';
import managed_service_controller from '../controllers/managed-service.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizePermissions } from '../middlewares/authorize.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';
import validate from '../middlewares/validate.middleware.js';
import { ManagedServiceCreateSchema, ManagedServiceUpdateSchema, ManagedServiceInventoryParamsSchema, ManagedServiceRecordParamsSchema} from '../schemas/managed-service.schema.js';

const router = express.Router();

const MANAGED_SERVICES = INVENTORY_ID + '/managed-services';
const MANAGED_SERVICE_ID = MANAGED_SERVICES + '/:managed_service_id';
// const MANAGED_SERVICE_ID_ENABLE = MANAGED_SERVICE_ID + '/enable';
// const MANAGED_SERVICE_ID_DISABLE = MANAGED_SERVICE_ID + '/disable';
// const MANAGED_SERVICE_ID_REMARKS = MANAGED_SERVICE_ID + '/remarks';
// const MANAGED_SERVICE_ID_TAGS = MANAGED_SERVICE_ID + '/tags';
// const MANAGED_SERVICE_ID_REMOVE_REMARKS = MANAGED_SERVICE_ID + '/remarks/remove';
// const MANAGED_SERVICE_ID_REMOVE_TAGS = MANAGED_SERVICE_ID + '/tags/remove';

router.get(MANAGED_SERVICES,
    authenticate,
    authorizePermissions(PERMISSIONS.MANAGED_SERVICES_LIST),
    validate(ManagedServiceInventoryParamsSchema, 'params'),
    async (req, res, next) => {
        await managed_service_controller.getAll(
            req,
            res,
            next
        );
    }
);

router.get(MANAGED_SERVICE_ID,
    authenticate,
    authorizePermissions(PERMISSIONS.MANAGED_SERVICES_READ),
    validate(ManagedServiceRecordParamsSchema, 'params'),
    async (req, res, next) => {
        await managed_service_controller.getOne(
            req,
            res,
            next
        );
    }
);

router.post(MANAGED_SERVICES,
    authenticate,
    authorizePermissions(PERMISSIONS.MANAGED_SERVICES_CREATE),
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
    authorizePermissions(PERMISSIONS.MANAGED_SERVICES_UPDATE),
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
    authorizePermissions(PERMISSIONS.MANAGED_SERVICES_DELETE),
    validate(ManagedServiceRecordParamsSchema, 'params'),
    async (req, res, next) => {
        await managed_service_controller.delete(
            req,
            res,
            next
        );
    }
);



// router.put(MANAGED_SERVICE_ID_ENABLE, authenticate, authorizePermissions(PERMISSIONS),
//     validate(ManagedServiceRecordParamsSchema, 'params'), async (req, res, next) => {
//         req.body = {
//             status: true
//         };
//         await managed_service_controller.setStatus(req, res, next);
//     });

// router.put(MANAGED_SERVICE_ID_DISABLE, authenticate, authorizePermissions(PERMISSIONS),
//     validate(ManagedServiceRecordParamsSchema, 'params'), async (req, res, next) => {
//         req.body = {
//             status: false
//         };
//         await managed_service_controller.setStatus(req, res, next);
//     });

// router.put(MANAGED_SERVICE_ID_REMARKS, authenticate, authorizePermissions(PERMISSIONS),
//     validate(ManagedServiceRecordParamsSchema, 'params'), async (req, res, next) => {

//         await managed_service_controller.setRemarks(req, res, next);

//     });

// router.put(MANAGED_SERVICE_ID_TAGS, authenticate, authorizePermissions(PERMISSIONS),
//     validate(ManagedServiceRecordParamsSchema, 'params'), async (req, res, next) => {

//         await managed_service_controller.setTags(req, res, next);

//     });

// router.delete(MANAGED_SERVICE_ID_REMOVE_REMARKS, authenticate, authorizePermissions(PERMISSIONS),
//     validate(ManagedServiceRecordParamsSchema, 'params'), async (req, res, next) => {

//         await managed_service_controller.removeRemarks(req, res, next);

//     });

// router.delete(MANAGED_SERVICE_ID_REMOVE_TAGS, authenticate, authorizePermissions(PERMISSIONS),
//     validate(ManagedServiceRecordParamsSchema, 'params'), async (req, res, next) => {

//         await managed_service_controller.removeTags(req, res, next);

//     });


export default router;