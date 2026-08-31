import express from 'express';

import sequelize from '../config/sequelize.js';
import { PROJECT_NAME, PROJECT_VERSION } from '../config/config.js';
import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';

const router = express.Router();
const PREFIX = '/health';

// string routes
const HEALTH = PREFIX;
const READY = PREFIX + '/ready';

// for endpoint /health to check app health
router.get(HEALTH, (req, res) => {

    res.json({
        response_status: "healthy",
        response_message: "API is ready to take requests. Check Readiness at /health/ready",
        project: PROJECT_NAME,
        version: PROJECT_VERSION,
        timestamp: new Date().toISOString()
    });
});

// for endpoit /health/ready to check readiness
router.get(READY, async (req, res) => {

    try {

        // send a test query to check if the app is able to fetch data from db
        await sequelize.authenticate();

        // return with success
        return res.status(200).json({
            status: "ready",
            service: PROJECT_NAME,
            message: "Database is ready and connected to take requests.",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch {

        // throw AppException if the app is unable to connect to database
        throw new AppException(
            'Database is not ready!',
            HTTP_STATUS.HTTP_503_SERVICE_UNAVAILABLE
        )
    }
});

export default router;