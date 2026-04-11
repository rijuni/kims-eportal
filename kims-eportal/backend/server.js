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
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
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

// --- NOTICES ROUTES ---
app.get("/api/notices", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM notices ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/notices", uploadNotice.single("noticeFile"), async (req, res) => {
    try {
        const { title, issued_by, date } = req.body;
        const document_url = req.file ? `/uploads/notices/${req.file.filename}` : null;
        
        await pool.query(
            'INSERT INTO notices (title, issued_by, date, document_url) VALUES (?, ?, ?, ?)', 
            [title, issued_by, date, document_url]
        );
        res.json({ success: true, message: "Notice added successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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

// --- EVENTS ROUTES ---
app.get("/api/events/upcoming", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/events", async (req, res) => {
    try {
        const { event_name, event_date, location } = req.body;
        await pool.query('INSERT INTO events (event_name, event_date, location) VALUES (?, ?, ?)', [event_name, event_date, location]);
        res.json({ success: true, message: "Event added successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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
app.get("/api/employees/birthdays", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM birthdays ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/birthdays/upload", upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Parse Excel from memory buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (sheet.length === 0) {
            return res.status(400).json({ success: false, message: "Excel file is empty" });
        }

        // Drop previous records
        await pool.query('TRUNCATE TABLE birthdays');

        // Insert new records
        for (const row of sheet) {
            // Fuzzy match column names since headers might have different cases
            const name = row['Name'] || row['name'] || row['Employee Name'];
            const dept = row['Department'] || row['department'] || row['Dept'] || row['dept'];
            const dob = row['DOB'] || row['dob'] || row['Date of Birth'] || row['date_of_birth'];

            if (name && dept && dob) {
                // To maintain legacy date format logic on front end or just insert the string
                // Excel dates might parse weird. XLSX util usually gives excel epoch int or string.
                // We'll trust whatever string or value it gives us and store it.
                await pool.query(
                    'INSERT INTO birthdays (name, department, date_of_birth) VALUES (?, ?, ?)',
                    [String(name).trim(), String(dept).trim(), String(dob).trim()]
                );
            }
        }

        res.json({ success: true, message: "Birthdays updated successfully from Excel!" });

    } catch (err) {
        console.error("Excel Upload Error:", err);
        res.status(500).json({ success: false, message: "Failed to process Excel file" });
    }
});

// Default Route
app.get("/", (req, res) => {
  res.send("KIMS E-Portal Backend is running...");
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`Network Access: http://10.11.173.89:${PORT}`);
});
