const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'kims@123',
    database: process.env.DB_NAME || 'kims_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create notice_pdfs and training_requests tables if they don't exist
async function initTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notice_pdfs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                notice_id INT NOT NULL,
                pdf_url VARCHAR(255) NOT NULL,
                pdf_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS training_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(255),
                department VARCHAR(255),
                module_subject VARCHAR(255),
                topic VARCHAR(255),
                sub_topic VARCHAR(255),
                email VARCHAR(255),
                contact VARCHAR(50),
                branch_location VARCHAR(255),
                start_date DATE,
                trainer_name VARCHAR(255) DEFAULT 'n/a',
                from_time VARCHAR(50) DEFAULT 'n/a',
                to_time VARCHAR(50) DEFAULT 'n/a',
                status VARCHAR(50) DEFAULT 'Pending',
                nominees JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Update users table with extra fields
        try {
            await pool.query('ALTER TABLE users ADD COLUMN email VARCHAR(255)');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE users ADD COLUMN contact VARCHAR(50)');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE users ADD COLUMN department VARCHAR(255)');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE users ADD COLUMN hinai_id VARCHAR(50)');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE users ADD COLUMN title VARCHAR(20)');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE users ADD COLUMN designation VARCHAR(255)');
        } catch (e) {}

        // Seed HR and Test users
        const seedUsers = [
            { username: 'admin', email: 'admin@kims.ac.in', contact: '0000000000', department: 'IT', hinai_id: '55', title: 'Mr.', designation: 'Super Admin' },
            { username: 'Sansad Badajena', email: 'sansad.badajena@kims.ac.in', contact: '7008981734', department: 'HR', hinai_id: 'H1001', title: 'Mr.', designation: 'HR Executive' },
            { username: 'Manoj Kumar Sethi', email: 'manojkumar.sethi@kims.ac.in', contact: '8260201162', department: 'HR', hinai_id: 'H1002', title: 'Mr.', designation: 'HR Assistant' },
            { username: 'test_user', email: 'test@kims.ac.in', contact: '0000000000', department: 'IT', hinai_id: 'H999', title: 'Mr.', designation: 'System Admin' },
            { username: 'test_user2', email: 'test2@kims.ac.in', contact: '1111111111', department: 'IT', hinai_id: '22', title: 'Ms.', designation: 'Junior Staff' }
        ];

        for (const user of seedUsers) {
            const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [user.username]);
            if (existing.length === 0) {
                await pool.query(
                    'INSERT INTO users (username, password, role, email, contact, department, hinai_id, title, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [user.username, '$2b$10$dummyhash', 'user', user.email, user.contact, user.department, user.hinai_id, user.title, user.designation]
                );
            } else {
                await pool.query(
                    'UPDATE users SET email = ?, contact = ?, department = ?, hinai_id = ?, title = ?, designation = ? WHERE username = ?',
                    [user.email, user.contact, user.department, user.hinai_id, user.title, user.designation, user.username]
                );
            }
        }
        try {
            await pool.query('ALTER TABLE training_requests ADD COLUMN nominees JSON');
        } catch (e) {}

        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                username VARCHAR(255),
                login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                logout_time DATETIME NULL,
                status ENUM('active', 'terminated', 'completed') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Ensure username column exists (in case table was created with old schema)
        try {
            await pool.query('ALTER TABLE user_sessions ADD COLUMN username VARCHAR(255) AFTER user_id');
        } catch (e) {}

        // Ensure status enum is correct
        try {
            await pool.query("ALTER TABLE user_sessions MODIFY COLUMN status ENUM('active', 'terminated', 'completed') DEFAULT 'active'");
        } catch (e) {}

        // Add training_type and remarks to users for Trainer Dashboard
        try {
            await pool.query('ALTER TABLE users ADD COLUMN training_type VARCHAR(255)');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE users ADD COLUMN training_remarks TEXT');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE training_requests ADD COLUMN user_id INT');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE training_requests ADD COLUMN training_type VARCHAR(255)');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE training_requests ADD COLUMN remarks TEXT');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE training_requests ADD COLUMN topic VARCHAR(255)');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE training_requests ADD COLUMN sub_topic VARCHAR(255)');
        } catch (e) {}
        try {
            await pool.query('ALTER TABLE training_requests ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
        } catch (e) {}
    } catch (err) {
        console.error("Error creating tables:", err);
    }
}
initTables();

// --- TRAINING REQUESTS ROUTES ---
app.post("/api/training-requests", async (req, res) => {
    try {
        const { userId, dept, module, topic, subTopic, name, email, contact, branch, requestedDate, nominees } = req.body;
        // Format date to YYYY-MM-DD safely
        let formattedDate = null;
        if (requestedDate) {
            try {
                formattedDate = new Date(requestedDate).toISOString().split('T')[0];
            } catch (e) {
                console.error("Date formatting error:", e);
            }
        }
        
        await pool.query(
            'INSERT INTO training_requests (user_id, name, department, module_subject, topic, sub_topic, email, contact, branch_location, start_date, nominees) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, name, dept, module, topic, subTopic, email, contact, branch, formattedDate, JSON.stringify(nominees || [])]
        );
        res.json({ success: true, message: "Training Request Submitted Successfully" });
    } catch (err) {
        console.error("Error inserting training request:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
app.get("/api/training-requests", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT tr.*, tu.department as trainer_dept
            FROM training_requests tr
            LEFT JOIN users tu ON tr.trainer_name = tu.username
            ORDER BY tr.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/api/trainer-data", async (req, res) => {
    try {
        const query = `
            SELECT 
                tr.id, tr.trainer_name as username, tr.branch_location as branch, 
                tr.start_date, tr.topic, tr.sub_topic, tr.module_subject as module, 
                tr.from_time, tr.to_time, tr.nominees, tr.status, tr.training_type, tr.remarks,
                u.department, u.hinai_id, u.designation
            FROM training_requests tr
            LEFT JOIN users u ON tr.trainer_name = u.username
            ORDER BY tr.created_at DESC
        `;
        const [trainers] = await pool.query(query);
        res.json(trainers);
    } catch (err) {
        console.error("Trainer Data Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/api/trainer-records", async (req, res) => {
    try {
        const query = `
            SELECT 
                tr.id as request_id, tr.id, tr.trainer_name, tr.training_type, tr.remarks, 
                tr.updated_at as last_training_update, tr.branch_location as branch,
                tr.start_date, tr.topic, tr.sub_topic, tr.module_subject as module,
                tr.from_time, tr.to_time, tr.nominees, tr.status,
                u.department as trainer_dept, u.hinai_id, u.designation, u.username
            FROM training_requests tr
            LEFT JOIN users u ON tr.trainer_name = u.username
            ORDER BY tr.created_at DESC
        `;
        const [records] = await pool.query(query);
        res.json(records);
    } catch (err) {
        console.error("Trainer Records Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put("/api/training-requests/bulk-status", async (req, res) => {
    try {
        const { ids, status } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ success: false, message: "Invalid IDs" });
        
        await pool.query('UPDATE training_requests SET status = ? WHERE id IN (?)', [status, ids]);
        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        console.error("Bulk Status Update Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put("/api/trainer-data/:id", async (req, res) => {
    try {
        const { id } = req.params; // This is the request_id now
        const { trainer_name, training_type, remarks, from_time, to_time, nominees } = req.body;
        
        let updates = ['trainer_name = ?', 'updated_at = CURRENT_TIMESTAMP'];
        let queryParams = [trainer_name];

        if (training_type !== undefined) {
            updates.push('training_type = ?');
            queryParams.push(training_type);
        }
        if (remarks !== undefined) {
            updates.push('remarks = ?');
            queryParams.push(remarks);
        }
        if (nominees !== undefined) {
            updates.push('nominees = ?');
            queryParams.push(nominees);
        }
        if (from_time !== undefined && to_time !== undefined) {
            updates.push('from_time = ?');
            updates.push('to_time = ?');
            queryParams.push(from_time, to_time);
        }

        queryParams.push(id);
        const updateQuery = `UPDATE training_requests SET ${updates.join(', ')} WHERE id = ?`;

        await pool.query(updateQuery, queryParams);
        res.json({ success: true, message: "Record updated successfully" });
    } catch (err) {
        console.error("Trainer Data Update Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Birthday API - MUST BE ABOVE :id route
app.get("/api/employees/birthdays", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT *, 
            STR_TO_DATE(date_of_birth, '%d-%m-%Y') as dob_date
            FROM birthdays 
            ORDER BY 
            CASE 
                WHEN MONTH(STR_TO_DATE(date_of_birth, '%d-%m-%Y')) > MONTH(CURDATE()) 
                     OR (MONTH(STR_TO_DATE(date_of_birth, '%d-%m-%Y')) = MONTH(CURDATE()) 
                         AND DAY(STR_TO_DATE(date_of_birth, '%d-%m-%Y')) >= DAY(CURDATE())) 
                THEN 0 
                ELSE 1 
            END,
            MONTH(STR_TO_DATE(date_of_birth, '%d-%m-%Y')), 
            DAY(STR_TO_DATE(date_of_birth, '%d-%m-%Y'))
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Mock Employee Search API - Linked to Users table
app.get("/api/employees/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        // Try to find in the actual users table by ID, HINAI ID, or Username
        const [users] = await pool.query(
            'SELECT hinai_id, title, username as name, designation, department, contact, email FROM users WHERE id = ? OR hinai_id = ? OR username = ?', 
            [id, id, id]
        );
        
        if (users.length > 0) {
            return res.json({ success: true, employee: users[0] });
        }

        // Fallback to mock data for demonstration
        const mockEmployees = {
            "101": { hinai_id: "H001", title: "Mr.", name: "John Doe", designation: "Staff Nurse", department: "Nursing", contact: "9876543210", email: "john@kims.in" },
            "102": { hinai_id: "H002", title: "Ms.", name: "Jane Smith", designation: "Medical Officer", department: "OPD", contact: "8765432109", email: "jane@kims.in" },
            "103": { hinai_id: "H003", title: "Mr.", name: "Robert Wilson", designation: "ICT Analyst", department: "IT", contact: "7654321098", email: "robert@kims.in" }
        };

        if (mockEmployees[id]) {
            res.json({ success: true, employee: mockEmployees[id] });
        } else {
            res.json({ 
                success: true, 
                employee: { 
                    hinai_id: `H${id}`, 
                    title: "Mr./Ms.", 
                    name: `Staff Member ${id}`, 
                    designation: "General Staff", 
                    department: "Hospital Services", 
                    contact: "N/A", 
                    email: `${id}@kims.in` 
                } 
            });
        }
    } catch (err) {
        console.error("Employee search error:", err);
        res.status(500).json({ success: false, message: "Error searching Account Center" });
    }
});

app.get("/api/training-requests", async (req, res) => {
    try {
        const [requests] = await pool.query('SELECT * FROM training_requests ORDER BY created_at DESC');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Auth Route
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Please provide username and password" });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, permissions: user.permissions },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        // Record session
        try {
            console.log("Attempting to record session for user:", user.username, "ID:", user.id);
            const [sessionResult] = await pool.query(
                'INSERT INTO user_sessions (user_id, username, login_time, status) VALUES (?, ?, CURRENT_TIMESTAMP, ?)',
                [user.id, user.username, 'active']
            );
            console.log("Session recorded successfully. ID:", sessionResult.insertId);
        } catch (sessionErr) {
            console.error("CRITICAL: Failed to record login session:", sessionErr);
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                permissions: user.permissions
            },
            token
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Sessions API
app.get("/api/sessions", async (req, res) => {
    try {
        const query = `
            SELECT s.*, u.hinai_id as emp_id 
            FROM user_sessions s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.login_time DESC
        `;
        const [sessions] = await pool.query(query);
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post("/api/sessions/:id/terminate", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
            'UPDATE user_sessions SET logout_time = CURRENT_TIMESTAMP, status = ? WHERE id = ?',
            ['terminated', id]
        );
        res.json({ success: true, message: "Session forced terminated" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post("/api/logout", async (req, res) => {
    const { userId } = req.body;
    try {
        if (userId) {
            // Find the most recent active session for this user and close it
            await pool.query(
                'UPDATE user_sessions SET logout_time = CURRENT_TIMESTAMP, status = ? WHERE user_id = ? AND status = ? ORDER BY login_time DESC LIMIT 1',
                ['completed', userId, 'active']
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Logout recording error:", err);
        res.status(500).json({ success: false });
    }
});

// --- USER MANAGEMENT ROUTES ---
app.get("/api/users", async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, username, role, permissions, email, contact, department, hinai_id, title, designation, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put("/api/users/:id/role", async (req, res) => {
    const { id } = req.params;
    const { role, permissions } = req.body;

    try {
        if (role && !['admin', 'sub_admin', 'user'].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        if (role && permissions !== undefined) {
            await pool.query('UPDATE users SET role = ?, permissions = ? WHERE id = ?', [role, JSON.stringify(permissions), id]);
        } else if (role) {
            await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        } else if (permissions !== undefined) {
            await pool.query('UPDATE users SET permissions = ? WHERE id = ?', [JSON.stringify(permissions), id]);
        }
        
        res.json({ success: true, message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Multer Setup for Excel Upload
const upload = multer({ storage: multer.memoryStorage() });

// Multer Disk Storage for Notices (PDF)
const noticesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/notices";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "notice-" + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadNotice = multer({ storage: noticesStorage });

// Multer Disk Storage for Events (Images)
const eventsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/events";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "event-" + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadEvent = multer({ storage: eventsStorage });

// Multer Disk Storage for Training Materials (PDFs)
const trainingStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/training";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "training-" + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadTraining = multer({ storage: trainingStorage });

// Multer Disk Storage for Birthdays (Profile Images)
const birthdaysStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/birthdays";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "birthday-" + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadBirthdayPhoto = multer({ storage: birthdaysStorage });

// --- NOTICES ROUTES ---
app.get("/api/notices", async (req, res) => {
    try {
        const isPublic = req.query.public === "true";
        let sql = "SELECT * FROM notices";
        if (isPublic) {
            sql += " WHERE is_visible = 1";
        }
        sql += " ORDER BY created_at DESC";
        const [notices] = await pool.query(sql);

        // Fetch all additional PDFs
        const [pdfs] = await pool.query("SELECT * FROM notice_pdfs");

        // Map PDFs to notices
        const noticesWithPdfs = notices.map(n => ({
            ...n,
            pdfs: [
                ...(n.document_url ? [{ id: 'primary', pdf_url: n.document_url, pdf_name: 'Main Document' }] : []),
                ...pdfs.filter(p => p.notice_id === n.id)
            ]
        }));

        res.json(noticesWithPdfs);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/notices", uploadNotice.single("noticeFile"), async (req, res) => {
    try {
        const { title, issued_by, date } = req.body;
        const document_url = req.file ? `/uploads/notices/${req.file.filename}` : null;

        await pool.query(
            'INSERT INTO notices (title, issued_by, date, document_url, is_visible) VALUES (?, ?, ?, ?, 1)',
            [title, issued_by, date, document_url]
        );
        res.json({ success: true, message: "Notice added successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to add an additional PDF to a notice
app.post("/api/notices/:id/pdfs", uploadNotice.single("noticeFile"), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

        const pdf_url = `/uploads/notices/${req.file.filename}`;
        const pdf_name = req.file.originalname;

        await pool.query(
            'INSERT INTO notice_pdfs (notice_id, pdf_url, pdf_name) VALUES (?, ?, ?)',
            [id, pdf_url, pdf_name]
        );
        res.json({ success: true, message: "Additional PDF added successfully", pdf: { pdf_url, pdf_name } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to delete a specific additional PDF
app.delete("/api/notices/pdfs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // Optional: delete from disk
        const [rows] = await pool.query("SELECT pdf_url FROM notice_pdfs WHERE id = ?", [id]);
        if (rows.length > 0) {
            const filePath = path.join(__dirname, rows[0].pdf_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await pool.query("DELETE FROM notice_pdfs WHERE id = ?", [id]);
        res.json({ success: true, message: "Additional PDF deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to delete the primary PDF
app.delete("/api/notices/:id/primary-pdf", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT document_url FROM notices WHERE id = ?", [id]);
        if (rows.length > 0 && rows[0].document_url) {
            const filePath = path.join(__dirname, rows[0].document_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await pool.query("UPDATE notices SET document_url = NULL WHERE id = ?", [id]);
        res.json({ success: true, message: "Primary PDF deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put("/api/notices/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, issued_by, date } = req.body;
        await pool.query(
            'UPDATE notices SET title = ?, issued_by = ?, date = ? WHERE id = ?',
            [title, issued_by, date, id]
        );
        res.json({ success: true, message: "Notice updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update notice" });
    }
});

app.delete("/api/notices/:id", async (req, res) => {
    try {
        await pool.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: "Notice deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.patch("/api/notices/:id/toggle-visibility", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT is_visible FROM notices WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "Notice not found" });

        const newVisibility = rows[0].is_visible ? 0 : 1;
        await pool.query('UPDATE notices SET is_visible = ? WHERE id = ?', [newVisibility, id]);
        res.json({ success: true, is_visible: newVisibility });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete("/api/notices", async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE notices');
        res.json({ success: true, message: "All notices cleared successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to clear notices" });
    }
});

// --- EVENTS ROUTES ---
app.get("/api/events/upcoming", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/events", uploadEvent.single('eventImage'), async (req, res) => {
    try {
        const { event_name, event_date, location, event_type, event_details } = req.body;
        const image_url = req.file ? `/uploads/events/${req.file.filename}` : null;

        await pool.query(
            'INSERT INTO events (event_name, event_date, location, event_type, event_details, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [event_name, event_date, location, event_type || 'General', event_details || '', image_url]
        );
        res.json({ success: true, message: "Event added successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put("/api/events/:id", uploadEvent.single('eventImage'), async (req, res) => {
    try {
        const { id } = req.params;
        const { event_name, event_date, location, event_type, event_details } = req.body;

        // Fetch existing to handle image cleanup
        const [existing] = await pool.query('SELECT image_url FROM events WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        let image_url = existing[0].image_url;
        if (req.file) {
            // New image uploaded, delete old one if it exists
            if (image_url) {
                const oldPath = path.join(__dirname, image_url);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            image_url = `/uploads/events/${req.file.filename}`;
        }

        await pool.query(
            'UPDATE events SET event_name = ?, event_date = ?, location = ?, event_type = ?, event_details = ?, image_url = ? WHERE id = ?',
            [event_name, event_date, location, event_type, event_details, image_url, id]
        );

        res.json({ success: true, message: "Event updated successfully" });
    } catch (err) {
        console.error("Update Event Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/events/upload", upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        let allEventRows = [];

        // Fuzzy search for event data
        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });

            if (!rawData || rawData.length === 0) continue;

            let headerRowIndex = -1;
            let colMap = {};

            for (let i = 0; i < Math.min(rawData.length, 20); i++) {
                const row = rawData[i];
                if (!row || !Array.isArray(row)) continue;

                const normalizedRow = row.map(cell => String(cell || '').toLowerCase().replace(/[\s._]/g, ''));

                const eventIdx = normalizedRow.findIndex(c => c === 'eventname' || c === 'event' || c === 'particulars' || c === 'title' || c === 'particular');
                const dateIdx = normalizedRow.findIndex(c => c === 'date' || c === 'eventdate');
                const timingIdx = normalizedRow.findIndex(c => c === 'timing' || c === 'time');
                const locationIdx = normalizedRow.findIndex(c => c === 'location' || c === 'venue' || c === 'place');
                const typeIdx = normalizedRow.findIndex(c => c === 'eventtype' || c === 'type' || c === 'category' || c === 'cat');
                const detailsIdx = normalizedRow.findIndex(c => c === 'eventdetails' || c === 'details' || c === 'description' || c === 'notes');

                if (eventIdx !== -1 && (dateIdx !== -1 || timingIdx !== -1)) {
                    headerRowIndex = i;
                    colMap.event = eventIdx;
                    colMap.date = dateIdx;
                    colMap.timing = timingIdx;
                    colMap.location = locationIdx;
                    colMap.type = typeIdx;
                    colMap.details = detailsIdx;
                    break;
                }
            }

            if (headerRowIndex !== -1) {
                for (let j = headerRowIndex + 1; j < rawData.length; j++) {
                    const row = rawData[j];
                    if (!row || !row[colMap.event]) continue;

                    let combinedDateUrl = "";
                    if (colMap.date !== undefined && colMap.date !== -1 && row[colMap.date]) {
                        combinedDateUrl += row[colMap.date];
                    }
                    if (colMap.timing !== undefined && colMap.timing !== -1 && row[colMap.timing]) {
                        if (combinedDateUrl) combinedDateUrl += ", ";
                        combinedDateUrl += row[colMap.timing];
                    }

                    allEventRows.push({
                        event_name: row[colMap.event],
                        event_date: combinedDateUrl || 'TBD',
                        location: colMap.location !== -1 ? (row[colMap.location] || 'KIMS') : 'KIMS',
                        event_type: colMap.type !== -1 ? (row[colMap.type] || 'General') : 'General',
                        event_details: colMap.details !== -1 ? (row[colMap.details] || '') : ''
                    });
                }
                if (allEventRows.length > 0) break;
            }
        }

        if (allEventRows.length === 0) {
            return res.status(400).json({ success: false, message: "No valid event data found. Headers should include 'Event' and 'Date'." });
        }

        // Truncate and insert
        await pool.query('TRUNCATE TABLE events');

        for (const e of allEventRows) {
            await pool.query(
                'INSERT INTO events (event_name, event_date, location, event_type, event_details) VALUES (?, ?, ?, ?, ?)',
                [
                    String(e.event_name).trim(),
                    String(e.event_date || 'TBD').trim(),
                    String(e.location || 'KIMS').trim(),
                    String(e.event_type || 'General').trim(),
                    String(e.event_details || '').trim()
                ]
            );
        }

        // Track last uploaded file
        await pool.query(
            'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            ['last_event_sync_file', req.file.originalname, req.file.originalname]
        );

        res.json({ success: true, message: `Successfully synced ${allEventRows.length} events!`, filename: req.file.originalname });
    } catch (err) {
        console.error("Event Sync Error:", err);
        res.status(500).json({ success: false, message: "Failed to process events Excel file." });
    }
});

app.delete("/api/events", async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE events');
        await pool.query('DELETE FROM system_settings WHERE setting_key = "last_event_sync_file"');
        res.json({ success: true, message: "Events cleared successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to clear events" });
    }
});

app.delete("/api/events/:id", async (req, res) => {
    try {
        await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- BIRTHDAYS ROUTES ---


app.post("/api/birthdays/upload", upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Save file to permanent storage
        const excelDir = path.join(__dirname, 'uploads', 'birthdays');
        if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });
        
        const fileName = `birthday_sync_${Date.now()}_${req.file.originalname}`;
        const filePath = path.join(excelDir, fileName);
        fs.writeFileSync(filePath, req.file.buffer);

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        let allBirthdayRows = [];

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

            if (!rawData || rawData.length === 0) continue;

            let headerRowIndex = -1;
            let colMap = {};

            for (let i = 0; i < Math.min(rawData.length, 25); i++) {
                const row = rawData[i];
                if (!row || !Array.isArray(row)) continue;

                const normalizedRow = row.map(cell => String(cell || '').toLowerCase().replace(/[\s._]/g, ''));

                const nameIdx = normalizedRow.findIndex(c => c === 'name' || c === 'employeename' || c === 'fullname' || c === 'staffname' || c === 'empname');
                const deptIdx = normalizedRow.findIndex(c => c === 'designation' || c === 'department' || c === 'dept');
                const dobIdx = normalizedRow.findIndex(c => c === 'birthday' || c === 'dob' || c === 'dateofbirth' || c === 'birthdate' || c === 'date');

                if (nameIdx !== -1 && (deptIdx !== -1 || dobIdx !== -1)) {
                    headerRowIndex = i;
                    colMap.name = nameIdx;
                    colMap.dept = deptIdx;
                    colMap.dob = dobIdx;
                    break;
                }
            }

            if (headerRowIndex !== -1) {
                for (let j = headerRowIndex + 1; j < rawData.length; j++) {
                    const row = rawData[j];
                    if (!row || !row[colMap.name]) continue;

                    const rawDob = row[colMap.dob];
                    let dobStr = 'TBD';

                    if (rawDob) {
                        const numericDob = Number(rawDob);
                        if (!isNaN(numericDob) && numericDob > 10000) {
                            const dateObj = xlsx.SSF.parse_date_code(numericDob);
                            if (dateObj) {
                                const d = dateObj.d < 10 ? `0${dateObj.d}` : dateObj.d;
                                const m = dateObj.m < 10 ? `0${dateObj.m}` : dateObj.m;
                                dobStr = `${d}-${m}-${dateObj.y}`;
                            } else {
                                dobStr = String(rawDob);
                            }
                        } else {
                            dobStr = String(rawDob).trim();
                        }
                    }

                    allBirthdayRows.push({
                        name: String(row[colMap.name] || '').trim(),
                        department: colMap.dept !== -1 ? String(row[colMap.dept] || '').trim() : 'Staff',
                        date_of_birth: dobStr
                    });
                }
                if (allBirthdayRows.length > 0) break;
            }
        }

        if (allBirthdayRows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid Excel Format for Birthday" });
        }

        // SMART SYNC: Fetch existing images before clearing
        const [existingBirthdays] = await pool.query('SELECT name, image FROM birthdays WHERE image IS NOT NULL');
        const imageMap = {};
        existingBirthdays.forEach(b => { imageMap[b.name.toLowerCase()] = b.image; });

        // Drop previous records
        await pool.query('TRUNCATE TABLE birthdays');

        for (const emp of allBirthdayRows) {
            const preservedImage = imageMap[emp.name.toLowerCase()] || null;
            await pool.query(
                'INSERT INTO birthdays (name, department, date_of_birth, image) VALUES (?, ?, ?, ?)',
                [emp.name, emp.department, emp.date_of_birth, preservedImage]
            );
        }

        // Track last uploaded file info
        const fileUrl = `/uploads/birthdays/${fileName}`;
        await pool.query(
            'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            ['last_birthday_sync_file', req.file.originalname, req.file.originalname]
        );
        await pool.query(
            'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            ['last_birthday_sync_url', fileUrl, fileUrl]
        );

        res.json({ 
            success: true, 
            message: "Birthdays updated successfully!", 
            filename: req.file.originalname,
            fileUrl: fileUrl
        });

    } catch (err) {
        console.error("Birthday upload error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- INDIVIDUAL BIRTHDAY MANAGEMENT ---
app.put("/api/employees/birthdays/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department, date_of_birth } = req.body;
        await pool.query(
            'UPDATE birthdays SET name = ?, department = ?, date_of_birth = ? WHERE id = ?',
            [name, department, date_of_birth, id]
        );
        res.json({ success: true, message: "Birthday updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update birthday" });
    }
});

app.delete("/api/employees/birthdays/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM birthdays WHERE id = ?', [id]);
        res.json({ success: true, message: "Birthday deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete birthday" });
    }
});

app.post("/api/employees/birthdays/:id/upload-image", uploadBirthdayPhoto.single("profileImage"), async (req, res) => {
    try {
        const { id } = req.params;
        const imagePath = req.file ? `/uploads/birthdays/${req.file.filename}` : null;
        if (!imagePath) return res.status(400).json({ success: false, message: "No image uploaded" });

        await pool.query('UPDATE birthdays SET image = ? WHERE id = ?', [imagePath, id]);
        res.json({ success: true, message: "Image uploaded successfully", imagePath });
    } catch (err) {
        console.error("Image Upload Error:", err);
        res.status(500).json({ success: false, message: "Failed to upload image" });
    }
});

app.delete("/api/birthdays", async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE birthdays');
        await pool.query('DELETE FROM system_settings WHERE setting_key = "last_birthday_sync_file"');
        res.json({ success: true, message: "Birthdays cleared successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to clear birthdays" });
    }
});

// --- HOLIDAYS ROUTES ---
app.get("/api/holidays", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM holidays ORDER BY sl_no ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/holidays/upload", upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        let allHolidayRows = [];

        // Try to find holiday data in ANY sheet
        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

            if (!rawData || rawData.length === 0) continue;

            // Find the header row (look for 'sl' and 'event' in the same row)
            let headerRowIndex = -1;
            let colMap = {};

            for (let i = 0; i < Math.min(rawData.length, 20); i++) {
                const row = rawData[i];
                if (!row || !Array.isArray(row)) continue;

                const normalizedRow = row.map(cell => String(cell || '').toLowerCase().replace(/[\s._]/g, ''));

                const slIdx = normalizedRow.findIndex(c => c === 'slno' || c === 'sl' || c === 'sino' || c === 'sn' || c === 'sno');
                const eventIdx = normalizedRow.findIndex(c => c === 'event' || c === 'particulars' || c === 'particular' || c === 'holidayname' || c === 'description');

                if (slIdx !== -1 && eventIdx !== -1) {
                    headerRowIndex = i;
                    colMap.sl = slIdx;
                    colMap.event = eventIdx;
                    colMap.date = normalizedRow.findIndex(c => c === 'date' || c === 'holidaydate');
                    colMap.days = normalizedRow.findIndex(c => c === 'days' || c === 'day');
                    colMap.nod = normalizedRow.findIndex(c => c === 'noofdays' || c === 'dayscount' || c === 'duration');
                    break;
                }
            }

            if (headerRowIndex !== -1) {
                // Found headers! Parse subsequent rows
                for (let j = headerRowIndex + 1; j < rawData.length; j++) {
                    const row = rawData[j];
                    if (!row || !row[colMap.sl] || !row[colMap.event]) continue;

                    allHolidayRows.push({
                        sl_no: row[colMap.sl],
                        date: colMap.date !== -1 ? row[colMap.date] : '',
                        days: colMap.days !== -1 ? row[colMap.days] : '',
                        no_of_days: colMap.nod !== -1 ? row[colMap.nod] : 1,
                        event: row[colMap.event]
                    });
                }
                if (allHolidayRows.length > 0) break; // Stop after finding the first sheet with data
            }
        }

        if (allHolidayRows.length === 0) {
            const sheetList = workbook.SheetNames.join(', ');
            return res.status(400).json({
                success: false,
                message: `No valid holiday data found. We checked sheets: [${sheetList}]. Please ensure your headers include 'Sl No' and 'Event' (or 'Particulars', 'sl.no', etc.).`
            });
        }

        // Truncate and insert
        await pool.query('TRUNCATE TABLE holidays');

        for (const h of allHolidayRows) {
            await pool.query(
                'INSERT INTO holidays (sl_no, date, days, no_of_days, event) VALUES (?, ?, ?, ?, ?)',
                [h.sl_no, String(h.date || '').trim(), String(h.days || '').trim(), parseInt(h.no_of_days) || 1, String(h.event || '').trim()]
            );
        }

        // Update last uploaded filename in system_settings
        await pool.query(
            'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            ['last_holiday_sync_file', req.file.originalname, req.file.originalname]
        );

        res.json({ success: true, message: `Successfully synced ${allHolidayRows.length} holidays from Excel!`, filename: req.file.originalname });
    } catch (err) {
        console.error("Holiday Excel Upload Error:", err);
        res.status(500).json({ success: false, message: "Failed to process Excel file. " + err.message });
    }
});

// --- SETTINGS ROUTES ---
app.get("/api/settings/:key", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT setting_value FROM system_settings WHERE setting_key = ?', [req.params.key]);
        if (rows.length === 0) {
            return res.json({ success: true, value: null });
        }
        res.json({ success: true, value: rows[0].setting_value });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete("/api/holidays", async (req, res) => {
    try {
        // Clear all holiday data
        await pool.query('TRUNCATE TABLE holidays');

        // Clear the filename tracking
        await pool.query('DELETE FROM system_settings WHERE setting_key = "last_holiday_sync_file"');

        res.json({ success: true, message: "Holiday list cleared successfully" });
    } catch (err) {
        console.error("Clear Holiday Error:", err);
        res.status(500).json({ success: false, message: "Failed to clear holiday list" });
    }
});

// --- TELEPHONE DIRECTORY ROUTES ---
app.get("/api/telephone", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM telephone_directory ORDER BY organisation, department, name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/api/telephone/departments", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT DISTINCT department FROM telephone_directory WHERE department IS NOT NULL AND department != "" ORDER BY department ASC');
        const departments = rows.map(r => r.department);
        res.json(departments);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/telephone/upload", upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        let allPhoneRows = [];

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

            if (!rawData || rawData.length === 0) continue;

            let headerRowIndex = -1;
            let colMap = {};

            for (let i = 0; i < Math.min(rawData.length, 20); i++) {
                const row = rawData[i];
                if (!row || !Array.isArray(row)) continue;

                const normalizedRow = row.map(cell => String(cell || '').toLowerCase().replace(/[\s._]/g, ''));

                const nameIdx = normalizedRow.findIndex(c => c === 'name' || c === 'employeename');
                const deptIdx = normalizedRow.findIndex(c => c === 'department' || c === 'dept');
                const orgIdx = normalizedRow.findIndex(c => c === 'organisation' || c === 'organization' || c === 'org');

                if (nameIdx !== -1 && deptIdx !== -1) {
                    headerRowIndex = i;
                    colMap.name = nameIdx;
                    colMap.dept = deptIdx;
                    colMap.org = orgIdx !== -1 ? orgIdx : -1;
                    colMap.loc = normalizedRow.findIndex(c => c === 'location' || c === 'loc');
                    colMap.ip = normalizedRow.findIndex(c => c === 'ipno' || c === 'ip' || c === 'extension');
                    colMap.mobile = normalizedRow.findIndex(c => c === 'mobileno' || c === 'mobile' || c === 'phone' || c === 'phoneno');
                    break;
                }
            }

            if (headerRowIndex !== -1) {
                for (let j = headerRowIndex + 1; j < rawData.length; j++) {
                    const row = rawData[j];
                    if (!row || !row[colMap.name]) continue;

                    allPhoneRows.push({
                        organisation: colMap.org !== -1 ? (row[colMap.org] || 'KIMS') : 'KIMS',
                        department: row[colMap.dept] || '',
                        location: colMap.loc !== -1 ? (row[colMap.loc] || '') : '',
                        name: row[colMap.name],
                        ip_no: colMap.ip !== -1 ? (row[colMap.ip] || '') : '',
                        mobile_no: colMap.mobile !== -1 ? (row[colMap.mobile] || '') : ''
                    });
                }
                if (allPhoneRows.length > 0) break;
            }
        }

        if (allPhoneRows.length === 0) {
            return res.status(400).json({ success: false, message: "No valid directory data found. Headers should include 'Name' and 'Department'." });
        }

        await pool.query('TRUNCATE TABLE telephone_directory');

        for (const r of allPhoneRows) {
            await pool.query(
                'INSERT INTO telephone_directory (organisation, department, location, name, ip_no, mobile_no) VALUES (?, ?, ?, ?, ?, ?)',
                [String(r.organisation).trim(), String(r.department).trim(), String(r.location).trim(), String(r.name).trim(), String(r.ip_no).trim(), String(r.mobile_no).trim()]
            );
        }

        await pool.query(
            'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            ['last_telephone_sync_file', req.file.originalname, req.file.originalname]
        );

        res.json({ success: true, message: `Successfully synced ${allPhoneRows.length} contacts!`, filename: req.file.originalname });
    } catch (err) {
        console.error("Telephone Sync Error:", err);
        res.status(500).json({ success: false, message: "Failed to process Excel file." });
    }
});

app.put("/api/telephone/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { organisation, department, location, name, ip_no, mobile_no } = req.body;

        await pool.query(
            'UPDATE telephone_directory SET organisation = ?, department = ?, location = ?, name = ?, ip_no = ?, mobile_no = ? WHERE id = ?',
            [organisation || '', department || '', location || '', name || '', ip_no || '', mobile_no || '', id]
        );
        res.json({ success: true, message: "Contact updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete("/api/telephone/:id", async (req, res) => {
    try {
        await pool.query('DELETE FROM telephone_directory WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: "Contact deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete("/api/telephone", async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE telephone_directory');
        await pool.query('DELETE FROM system_settings WHERE setting_key = "last_telephone_sync_file"');
        res.json({ success: true, message: "Directory cleared successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to clear directory" });
    }
});

// --- TRAINING MATERIALS ROUTES ---
app.get("/api/training", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM training_materials ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/training", uploadTraining.single("trainingFile"), async (req, res) => {
    try {
        const { topic, topic_area } = req.body;
        const document_url = req.file ? `/uploads/training/${req.file.filename}` : null;

        await pool.query(
            'INSERT INTO training_materials (topic, topic_area, document_url) VALUES (?, ?, ?)',
            [topic, topic_area, document_url]
        );
        res.json({ success: true, message: "Material added successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete("/api/training/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // Fetch existing to handle file cleanup
        const [existing] = await pool.query('SELECT document_url FROM training_materials WHERE id = ?', [id]);
        if (existing.length > 0 && existing[0].document_url) {
            const filePath = path.join(__dirname, existing[0].document_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        await pool.query('DELETE FROM training_materials WHERE id = ?', [id]);
        res.json({ success: true, message: "Material deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Default Route
app.get("/", (req, res) => {
    res.send("KIMS E-Portal Backend is running...");
});

// Start Server
initTables().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Local Access: http://localhost:${PORT}`);
        console.log(`Network Access: http://10.11.173.89:${PORT}`);
    });
});
