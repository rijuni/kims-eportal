const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkDB() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'kims@123',
        database: process.env.DB_NAME || 'kims_portal',
    });

    try {
        console.log("Checking database schema for 'birthdays' table...");
        const [rows] = await pool.query("DESCRIBE birthdays");
        console.log("Table structure:", JSON.stringify(rows, null, 2));

        const [data] = await pool.query("SELECT COUNT(*) as count FROM birthdays");
        console.log("Total records in birthdays table:", data[0].count);

        if (data[0].count > 0) {
            const [sample] = await pool.query("SELECT * FROM birthdays LIMIT 5");
            console.log("Sample records:", JSON.stringify(sample, null, 2));
        }

    } catch (err) {
        console.error("Database check failed:", err.message);
    } finally {
        await pool.end();
    }
}

checkDB();
