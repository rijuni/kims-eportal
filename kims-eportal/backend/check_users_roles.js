const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'kims@123',
            database: process.env.DB_NAME || 'kims_portal'
        });

        const [rows] = await connection.query('SELECT id, username, role FROM users');
        console.log('Users in database:');
        console.log(JSON.stringify(rows, null, 2));
        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkUsers();
