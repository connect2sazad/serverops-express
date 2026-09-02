import express from 'express';

import { INVENTORY_ID } from './inventories.route.js';
import managed_command_controller from '../controllers/managed-command.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizePermissions } from '../middlewares/authorize.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';
import validate from '../middlewares/validate.middleware.js';
import { ManagedCommandCreateSchema, ManagedCommandUpdateSchema, ManagedCommandInventoryParamsSchema, ManagedCommandRecordParamsSchema, ManagedCommandExecuteParamsSchema } from '../schemas/managed-command.schema.js';
import command_controller from '../controllers/command-execution.controller.js';

const router = express.Router();

const MANAGED_COMMANDS = INVENTORY_ID + '/managed-commands';
const MANAGED_COMMAND_ID = MANAGED_COMMANDS + '/:managed_command_id';
const MANAGED_COMMAND_ID_ENABLE = MANAGED_COMMAND_ID + '/enable';
const MANAGED_COMMAND_ID_DISABLE = MANAGED_COMMAND_ID + '/disable';
const MANAGED_COMMAND_ID_REMARKS = MANAGED_COMMAND_ID + '/remarks';
const MANAGED_COMMAND_ID_TAGS = MANAGED_COMMAND_ID + '/tags';
const MANAGED_COMMAND_ID_REMOVE_REMARKS = MANAGED_COMMAND_ID + '/remarks/remove';
const MANAGED_COMMAND_ID_REMOVE_TAGS = MANAGED_COMMAND_ID + '/tags/remove';

// execute command
const MANAGED_COMMAND_ID_EXECUTE = MANAGED_COMMAND_ID + '/execute';

router.get(MANAGED_COMMANDS, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_LIST),
    validate(ManagedCommandInventoryParamsSchema, 'params'),
    async (req, res, next) => {
        await managed_command_controller.getAll(req, res, next);
    }
);

router.get(MANAGED_COMMAND_ID, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_READ),
    validate(ManagedCommandRecordParamsSchema, 'params'),
    async (req, res, next) => {
        await managed_command_controller.getOne(req, res, next);
    }
);

// create a new managed command
router.post(MANAGED_COMMANDS, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_CREATE),
    validate(ManagedCommandInventoryParamsSchema, 'params'),
    validate(ManagedCommandCreateSchema),
    async (req, res, next) => {
        await managed_command_controller.create(req, res, next);
    }
);

// update a managed command
router.put(MANAGED_COMMAND_ID, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_UPDATE),
    validate(ManagedCommandRecordParamsSchema, 'params'),
    validate(ManagedCommandUpdateSchema),
    async (req, res, next) => {
        await managed_command_controller.update(req, res, next);
    }
);


// delete managed command
router.delete(MANAGED_COMMAND_ID, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_DELETE),
    validate(ManagedCommandRecordParamsSchema, 'params'),
    async (req, res, next) => {

        await managed_command_controller.delete(req, res, next);

    });

router.put(MANAGED_COMMAND_ID_ENABLE, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_STATUS),
    validate(ManagedCommandRecordParamsSchema, 'params'), async (req, res, next) => {
        req.body = {
            status: true
        };
        await managed_command_controller.setStatus(req, res, next);
    });

router.put(MANAGED_COMMAND_ID_DISABLE, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_STATUS),
    validate(ManagedCommandRecordParamsSchema, 'params'), async (req, res, next) => {
        req.body = {
            status: false
        };
        await managed_command_controller.setStatus(req, res, next);
    });

router.put(MANAGED_COMMAND_ID_REMARKS, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_UPDATE),
    validate(ManagedCommandRecordParamsSchema, 'params'), async (req, res, next) => {

        await managed_command_controller.setRemarks(req, res, next);

    });

router.put(MANAGED_COMMAND_ID_TAGS, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_UPDATE),
    validate(ManagedCommandRecordParamsSchema, 'params'), async (req, res, next) => {

        await managed_command_controller.setTags(req, res, next);

    });

router.delete(MANAGED_COMMAND_ID_REMOVE_REMARKS, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_UPDATE),
    validate(ManagedCommandRecordParamsSchema, 'params'), async (req, res, next) => {

        await managed_command_controller.removeRemarks(req, res, next);

    });

router.delete(MANAGED_COMMAND_ID_REMOVE_TAGS, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_UPDATE),
    validate(ManagedCommandRecordParamsSchema, 'params'), async (req, res, next) => {

        await managed_command_controller.removeTags(req, res, next);

    });

// =========================================================================
// execute managed command
router.post(MANAGED_COMMAND_ID_EXECUTE, authenticate, authorizePermissions(PERMISSIONS.MANAGED_COMMANDS_EXECUTE),
    validate(ManagedCommandExecuteParamsSchema, 'params'),
    async (req, res, next) => {
        await command_controller.executeManagedCommand(req, res, next);
    }
);

export default router;