const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function createDemoUser() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'kims@123',
        database: process.env.DB_NAME || 'kims_portal'
    });

    try {
        const username = 'test_user2';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'user';
        const permissions = null;

        // Check if user exists
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            console.log("User already exists. Updating role to 'user'...");
            await pool.query('UPDATE users SET role = ?, permissions = ? WHERE username = ?', [role, permissions, username]);
        } else {
            console.log("Creating second test user...");
            await pool.query('INSERT INTO users (username, password, role, permissions) VALUES (?, ?, ?, ?)', [username, hashedPassword, role, permissions]);
        }
        console.log("Success! Second Test ID: test_user2 / password123 (Role: user)");
    } catch (err) {
        console.error("Error creating demo user:", err);
    } finally {
        await pool.end();
    }
}

createDemoUser();
