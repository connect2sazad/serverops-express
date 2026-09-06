import express from 'express';

import {
    PERMISSIONS,
} from '../config/permissions.js';

import user_role_controller from
    '../controllers/user_role.controller.js';

import {
    authenticate,
} from '../middlewares/auth.middleware.js';

import {
    authorizePermissions,
} from '../middlewares/authorize.middleware.js';

import validate from
    '../middlewares/validate.middleware.js';

import {
    UserRoleCreateSchema,
    UserRoleUpdateSchema,
} from '../schemas/user-role.schema.js';


const router = express.Router();

const PREFIX = '/user-roles';

const USER_ROLES = PREFIX;

const USER_ROLE_ID =
    `${PREFIX}/:id`;

const USER_ROLE_ENABLE =
    `${PREFIX}/:id/enable`;

const USER_ROLE_DISABLE =
    `${PREFIX}/:id/disable`;

const USER_ROLE_REMARKS =
    `${PREFIX}/:id/remarks`;

const USER_ROLE_TAGS =
    `${PREFIX}/:id/tags`;

const USER_ROLE_REMOVE_REMARKS =
    `${PREFIX}/:id/remarks/remove`;

const USER_ROLE_REMOVE_TAGS =
    `${PREFIX}/:id/tags/remove`;


// Get all user roles
router.get(
    USER_ROLES,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_LIST
    ),

    async (req, res, next) => {
        await user_role_controller.get(
            req,
            res,
            next
        );
    }
);


// Create a user role
router.post(
    USER_ROLES,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_CREATE
    ),

    validate(
        UserRoleCreateSchema
    ),

    async (req, res, next) => {
        await user_role_controller.create(
            req,
            res,
            next
        );
    }
);


// Enable a user role
router.put(
    USER_ROLE_ENABLE,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_STATUS
    ),

    async (req, res, next) => {
        req.body = {
            status: true,
        };

        await user_role_controller.setStatus(
            req,
            res,
            next
        );
    }
);


// Disable a user role
router.put(
    USER_ROLE_DISABLE,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_STATUS
    ),

    async (req, res, next) => {
        req.body = {
            status: false,
        };

        await user_role_controller.setStatus(
            req,
            res,
            next
        );
    }
);


// Update user-role remarks
router.put(
    USER_ROLE_REMARKS,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_UPDATE
    ),

    async (req, res, next) => {
        await user_role_controller.setRemarks(
            req,
            res,
            next
        );
    }
);


// Update user-role tags
router.put(
    USER_ROLE_TAGS,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_UPDATE
    ),

    async (req, res, next) => {
        await user_role_controller.setTags(
            req,
            res,
            next
        );
    }
);


// Remove user-role remarks
router.delete(
    USER_ROLE_REMOVE_REMARKS,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_UPDATE
    ),

    async (req, res, next) => {
        await user_role_controller.removeRemarks(
            req,
            res,
            next
        );
    }
);


// Remove user-role tags
router.delete(
    USER_ROLE_REMOVE_TAGS,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_UPDATE
    ),

    async (req, res, next) => {
        await user_role_controller.removeTags(
            req,
            res,
            next
        );
    }
);


// Get one user role
router.get(
    USER_ROLE_ID,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_READ
    ),

    async (req, res, next) => {
        await user_role_controller.get(
            req,
            res,
            next
        );
    }
);


// Update a user role
router.put(
    USER_ROLE_ID,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_UPDATE
    ),

    validate(
        UserRoleUpdateSchema
    ),

    async (req, res, next) => {
        await user_role_controller.update(
            req,
            res,
            next
        );
    }
);


// Delete a user role
router.delete(
    USER_ROLE_ID,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USER_ROLES_DELETE
    ),

    async (req, res, next) => {
        await user_role_controller.delete(
            req,
            res,
            next
        );
    }
);


export default router;