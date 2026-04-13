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

        // Create Notices Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                issued_by VARCHAR(255) NOT NULL,
                date VARCHAR(50) NOT NULL,
                document_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table `notices` created or already exists.');

        // Create Events Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_name VARCHAR(255) NOT NULL,
                event_date VARCHAR(50) NOT NULL,
                location VARCHAR(255) NOT NULL,
                event_type VARCHAR(255) DEFAULT 'General',
                event_details TEXT,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table `events` created or already exists.');

        // Create Birthdays Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS birthdays (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                department VARCHAR(255) NOT NULL,
                date_of_birth VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table `birthdays` created or already exists.');

        // Create Holidays Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS holidays (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sl_no INT NOT NULL,
                date VARCHAR(50) NOT NULL,
                days VARCHAR(50) NOT NULL,
                no_of_days INT NOT NULL,
                event VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create Telephone Directory Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS telephone_directory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                organisation VARCHAR(255),
                department VARCHAR(255),
                location VARCHAR(255),
                name VARCHAR(255),
                ip_no VARCHAR(100),
                mobile_no VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table `telephone_directory` created or already exists.');

        // Create Training Materials Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS training_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                topic VARCHAR(255) NOT NULL,
                topic_area VARCHAR(255) NOT NULL,
                document_url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table `training_materials` created or already exists.');

        // Create System Settings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(255) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table `system_settings` created or already exists.');

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
