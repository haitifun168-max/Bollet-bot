'use strict';
const { Pool } = require('pg');
const config = require('../config');

if (!config.DATABASE_URL) {
    console.error('DATABASE_URL chua duoc cau hinh trong .env!');
    process.exit(1);
}

const pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err.message);
});

async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.warn(`Slow query (${duration}ms):`, text);
        }
        return res;
    } catch (err) {
        console.error('DB query error:', err.message, '\nSQL:', text);
        throw err;
    }
}

async function getClient() {
    const client = await pool.connect();
    return client;
}

module.exports = { query, getClient, pool };
