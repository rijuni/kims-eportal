const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

// Mock Data
const notices = [
  {
    id: 1,
    title: "Counter Wise Allotment of Schools/Department/Units",
    issued_by: "Principal KIMS",
    date: "1st January, 2026",
    document_url: "#"
  },
  {
    id: 2,
    title: "New Health & Safety Protocols for Q2",
    issued_by: "HR Department",
    date: "15th January, 2026",
    document_url: "#"
  },
  {
    id: 3,
    title: "Annual Sports Meet 2026 - Registration Open",
    issued_by: "Sports Committee",
    date: "20th January, 2026",
    document_url: "#"
  }
];

const events = [
  { id: 1, event_name: "World Cancer Day", event_date: "4th February, 2026", location: "KIMS Cancer Centre" },
  { id: 2, event_name: "International Women's Day", event_date: "8th March, 2026", location: "KIMS Lobby" },
  { id: 3, event_name: "World Kidney Day", event_date: "13th March, 2026", location: "KIMS Super speciality & Cancer Centre" },
];

const birthdays = [
  {
    id: 1,
    name: "Mr. Debi Prasad Panda",
    department: "ICT CELL",
    date_of_birth: "18th March, 2026"
  },
  {
    id: 2,
    name: "Dr. Ananya Roy",
    department: "Cardiology",
    date_of_birth: "22nd March, 2026"
  }
];

// Routes
app.get("/api/notices", (req, res) => {
  res.json(notices);
});

app.get("/api/events/upcoming", (req, res) => {
  res.json(events);
});

app.get("/api/employees/birthdays", (req, res) => {
  res.json(birthdays);
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
