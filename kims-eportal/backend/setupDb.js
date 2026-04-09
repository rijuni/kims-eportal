const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function setupDatabase() {
    try {
        // Connect to MySQL server without selecting a specific database first
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'kims@123'
        });

        console.log('Connected to MySQL successfully.');

        // Create Database
        await connection.query(`CREATE DATABASE IF NOT EXISTS kims_portal`);
        console.log('Database `kims_portal` created or already exists.');

        // Use the Database
        await connection.query(`USE kims_portal`);

        // Create Users Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table `users` created or already exists.');

        // Check if admin user already exists
        const [rows] = await connection.query(`SELECT * FROM users WHERE username = 'admin'`);
        if (rows.length === 0) {
            // Hash password and insert
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt); // Default admin password here? No, the user said admin/admin earlier, wait... No, they provided MySQL password `kims@123`, but what about the admin UI password? I'll set username 'admin' and password 'admin'. The admin can change it later if we add that feature. Let's just set 'admin' as password.

            await connection.query(
                `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
                ['admin', hashedPassword, 'admin']
            );
            console.log('Admin user successfully seeded. (username: admin, password: admin)');
        } else {
            console.log('Admin user already exists. Skipping insertion.');
        }

        await connection.end();
        console.log('Database setup complete.');

    } catch (err) {
        console.error('Error setting up database:', err.message);
    }
}

setupDatabase();
