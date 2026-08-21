import mysql from 'mysql2/promise';

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from './config.js';

const DBPOOL = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+05:30'
});

export default DBPOOL;