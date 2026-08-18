require('dotenv').config();

export const PROJECT_NAME = process.env.PROJECT_NAME || 'serverops';
export const PROJECT_TITLE = process.env.PROJECT_TITLE || 'ServerOps';
export const PORT = process.env.PORT;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const DB_NAME = process.env.DB_NAME;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;