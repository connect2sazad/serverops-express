import 'dotenv/config'
import { execSync } from 'node:child_process';

import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';

export const PROJECT_NAME = process.env.PROJECT_NAME || 'serverops';
export const PROJECT_TITLE = process.env.PROJECT_TITLE || 'ServerOps';
export const PROJECT_VERSION = process.env.PROJECT_VERSION || 'v1.0.0';
export const API_DOCS_ENABLE = Boolean(process.env.API_DOCS_ENABLE || 'false');
export const ENVIRONMENT = process.env.ENVIRONMENT || 'production';
export const PORT = Number(getRequiredEnv('PORT'));
export const JWT_SECRET_KEY = getRequiredEnv('JWT_SECRET_KEY');
export const DB_HOST = getRequiredEnv('DB_HOST');
export const DB_NAME = getRequiredEnv('DB_NAME');
export const DB_USER = getRequiredEnv('DB_USER');
export const DB_PASS = getRequiredEnv('DB_PASS', true);
export const API_PREFIX = getRequiredEnv('API_PREFIX', true);
export const ALLOWED_ORIGINS = getRequiredEnv('ALLOWED_ORIGINS', true);

export const NODE_MIN_REQUIRED_VERSION = process.env.NODE_MIN_REQUIRED_VERSION || '22.0.0';

console.log((process.version).replace('v', ''));

// check node version before starting the app
const currentNodeVersion = process.versions.node;
if (isVersionLessThan(currentNodeVersion, NODE_MIN_REQUIRED_VERSION)) {
    throw new AppException(
        `App Crashed - Node Version Required >= v${NODE_MIN_REQUIRED_VERSION}, Your Node Version = v${currentNodeVersion}`,
        HTTP_STATUS.HTTP_500_INTERNAL_SERVER_ERROR,
        {
            'node_minimum_required_verison': NODE_MIN_REQUIRED_VERSION,
            'your_node_version': currentNodeVersion,
            'run_this_in_cmd_to_install_latest_node_to_fix': 'nvm install node && nvm use node && nvm alias default node'
        }
    );
}

function getRequiredEnv(name, allow_empty = false) {
    const value = process.env[name];

    if (value === undefined || value === null || (!allow_empty && value.trim() === '')) {
        throw new AppException(
            `${name} is not defined in .env`,
            HTTP_STATUS.HTTP_500_INTERNAL_SERVER_ERROR
        )
    }

    return value;
}

function isVersionLessThan(current, required) {
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.replace(/^v/, '').split('.').map(Number);

    for (let i = 0; i < 3; i++) {
        if (currentParts[i] < requiredParts[i]) {
            return true;
        }

        if (currentParts[i] > requiredParts[i]) {
            return false;
        }
    }

    return false;
}