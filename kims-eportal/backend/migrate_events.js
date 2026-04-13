const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'kims@123',
            database: process.env.DB_NAME || 'kims_portal'
        });

        console.log('Migrating events table...');
        
        try {
            await connection.query(`ALTER TABLE events ADD COLUMN event_type VARCHAR(255) DEFAULT 'General'`);
            console.log('Added event_type column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('event_type already exists.');
            else throw e;
        }

        try {
            await connection.query(`ALTER TABLE events ADD COLUMN event_details TEXT`);
            console.log('Added event_details column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('event_details already exists.');
            else throw e;
        }

        console.log('Migration successful.');
        await connection.end();
    } catch (err) {
        console.error('Migration failed:', err.message);
    }
}

migrate();
