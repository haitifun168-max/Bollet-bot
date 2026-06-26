'use strict';
const fs = require('fs');
const path = require('path');
const { query, pool } = require('./index');

async function runMigration() {
    console.log('🚀 Starting Database Migration to Supabase...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
        console.error('❌ schema.sql file not found at:', schemaPath);
        process.exit(1);
    }
    
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    try {
        console.log('⏳ Executing migration script...');
        await query(sql);
        console.log('✅ Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('🔌 Database pool closed.');
    }
}

runMigration();
