const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAdminRole() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'kims@123',
            database: process.env.DB_NAME || 'kims_portal'
        });

        const [result] = await connection.query("UPDATE users SET role = 'admin' WHERE username = 'admin'");
        console.log(`Updated ${result.affectedRows} user(s).`);
        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

fixAdminRole();
