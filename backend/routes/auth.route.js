import express from 'express';

import auth_controller from
    '../controllers/auth.controller.js';

import validate from
    '../middlewares/validate.middleware.js';

import {
    authenticate,
} from '../middlewares/auth.middleware.js';

import {
    authorizePermissions,
} from '../middlewares/authorize.middleware.js';

import {
    loginLimiter,
} from '../middlewares/rate-limit.middleware.js';

import {
    loginSchema,
    registerSchema,
} from '../schemas/auth.schema.js';

import {
    PERMISSIONS,
} from '../config/permissions.js';


const router = express.Router();

const PREFIX = '/auth';

const AUTH_LOGIN =
    `${PREFIX}/login`;

const AUTH_REGISTER =
    `${PREFIX}/register`;

const AUTH_LOGOUT =
    `${PREFIX}/logout`;


// Register a user
router.post(
    AUTH_REGISTER,

    authenticate,

    authorizePermissions(
        PERMISSIONS.USERS_CREATE
    ),

    validate(
        registerSchema
    ),

    async (req, res, next) => {
        await auth_controller.register(
            req,
            res,
            next
        );
    }
);


// Login using /auth
router.post(
    PREFIX,

    loginLimiter,

    validate(
        loginSchema
    ),

    async (req, res, next) => {
        await auth_controller.login(
            req,
            res,
            next
        );
    }
);


// Login using /auth/login
router.post(
    AUTH_LOGIN,

    loginLimiter,

    validate(
        loginSchema
    ),

    async (req, res, next) => {
        await auth_controller.login(
            req,
            res,
            next
        );
    }
);


// Logout
router.post(
    AUTH_LOGOUT,

    authenticate,

    async (req, res, next) => {
        await auth_controller.logout(
            req,
            res,
            next
        );
    }
);


export default router;