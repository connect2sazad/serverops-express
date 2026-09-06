import express from 'express';

import {
    PERMISSIONS,
} from '../config/permissions.js';

import user_controller from
    '../controllers/user.controller.js';

import validate from
    '../middlewares/validate.middleware.js';

import {
    authenticate,
} from '../middlewares/auth.middleware.js';

import {
    authorizePermissions,
} from '../middlewares/authorize.middleware.js';

import {
    UserPermissionsUpdateSchema,
    UserUpdateSchema,
} from '../schemas/user.schema.js';


const router = express.Router();

const PREFIX = '/users';

const USERS =
    PREFIX;

const USER_SELF =
    `${PREFIX}/self`;

const USER_ENABLE =
    `${PREFIX}/:id/enable`;

const USER_DISABLE =
    `${PREFIX}/:id/disable`;

const USER_PERMISSIONS =
    `${PREFIX}/:id/permissions`;

const USER_REMARKS =
    `${PREFIX}/:id/remarks`;

const USER_TAGS =
    `${PREFIX}/:id/tags`;

const USER_REMOVE_REMARKS =
    `${PREFIX}/:id/remarks/remove`;

const USER_REMOVE_TAGS =
    `${PREFIX}/:id/tags/remove`;

const USER_ID =
    `${PREFIX}/:id`;


// Get all users
router.get(
    USERS,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_LIST
    ),

    async (req, res, next) => {
        await user_controller.get(
            req,
            res,
            next
        );
    }
);


// Get the authenticated user
router.get(
    USER_SELF,

    authenticate,

    async (req, res, next) => {
        await user_controller.self(
            req,
            res,
            next
        );
    }
);


// Enable a user
router.put(
    USER_ENABLE,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_STATUS
    ),

    async (req, res, next) => {
        req.body = {
            status: true,
        };

        await user_controller.setStatus(
            req,
            res,
            next
        );
    }
);


// Disable a user
router.put(
    USER_DISABLE,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_STATUS
    ),

    async (req, res, next) => {
        req.body = {
            status: false,
        };

        await user_controller.setStatus(
            req,
            res,
            next
        );
    }
);


// Update individual user permissions
router.put(
    USER_PERMISSIONS,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_PERMISSIONS_UPDATE
    ),

    validate(
        UserPermissionsUpdateSchema
    ),

    async (req, res, next) => {
        await user_controller
            .updatePermissions(
                req,
                res,
                next
            );
    }
);


// Update user remarks
router.put(
    USER_REMARKS,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_UPDATE
    ),

    async (req, res, next) => {
        await user_controller.setRemarks(
            req,
            res,
            next
        );
    }
);


// Update user tags
router.put(
    USER_TAGS,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_UPDATE
    ),

    async (req, res, next) => {
        await user_controller.setTags(
            req,
            res,
            next
        );
    }
);


// Remove user remarks
router.delete(
    USER_REMOVE_REMARKS,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_UPDATE
    ),

    async (req, res, next) => {
        await user_controller.removeRemarks(
            req,
            res,
            next
        );
    }
);


// Remove user tags
router.delete(
    USER_REMOVE_TAGS,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_UPDATE
    ),

    async (req, res, next) => {
        await user_controller.removeTags(
            req,
            res,
            next
        );
    }
);


// Get one user
router.get(
    USER_ID,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_READ
    ),

    async (req, res, next) => {
        await user_controller.get(
            req,
            res,
            next
        );
    }
);


// Update a user
router.put(
    USER_ID,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_UPDATE
    ),

    validate(
        UserUpdateSchema
    ),

    async (req, res, next) => {
        await user_controller.update(
            req,
            res,
            next
        );
    }
);


// Delete a user
router.delete(
    USER_ID,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_DELETE
    ),

    async (req, res, next) => {
        await user_controller.delete(
            req,
            res,
            next
        );
    }
);


export default router;