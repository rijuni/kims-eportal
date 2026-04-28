const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function createMoreUsers() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'kims@123',
        database: process.env.DB_NAME || 'kims_portal'
    });

    try {
        const users = [
            { username: 'test_user3', password: 'password123', role: 'user' },
            { username: 'test_user4', password: 'password123', role: 'user' }
        ];

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            
            // Check if user exists
            const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [user.username]);
            if (rows.length > 0) {
                console.log(`User ${user.username} already exists.`);
            } else {
                console.log(`Creating ${user.username}...`);
                await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [user.username, hashedPassword, user.role]);
                console.log(`Created ${user.username}.`);
            }
        }
    } catch (err) {
        console.error("Error creating test users:", err);
    } finally {
        await pool.end();
    }
}

createMoreUsers();
