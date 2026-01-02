const express = require('express');
const cors = require('cors');
const db = require('./db');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. DATABASE INITIALIZATION ---
const initDB = async () => {
    try {
        const sql = fs.readFileSync('./init.sql').toString();
        await db.query(sql);
        console.log("-----------------------------------------");
        console.log("   DILLI DRISHTI v4.0 ENGINE LOADED      ");
        console.log("   STRICT GOVERNANCE PROTOCOLS ACTIVE    ");
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Database Initialization Error:", err);
    }
};
initDB();

// HELPER: Haversine Distance Formula (In Meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// --- 2. DASHBOARD ROUTES ---

// Commissioner's Global Data Fetch
app.get('/check-db', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT e.*, w.ward_name, w.lat, w.lng, w.radius_meters 
            FROM employees e 
            JOIN wards w ON e.ward_id = w.id
            ORDER BY e.integrity_score DESC
        `);
        res.json(result.rows);
    } catch (err) { 
        console.error("Dashboard Fetch Error:", err);
        res.status(500).json({ error: "Database Connection Failed" }); 
    }
});

// --- 3. ATTENDANCE SYSTEM (TRIPLE-LOCK) ---

app.post('/api/attendance/checkin', async (req, res) => {
    const { employee_id, user_lat, user_lng, face_score } = req.body;
    try {
        const empQuery = await db.query(`
            SELECT e.*, w.lat as w_lat, w.lng as w_lng, w.radius_meters 
            FROM employees e 
            JOIN wards w ON e.ward_id = w.id 
            WHERE e.id = $1`, [employee_id]);

        if (empQuery.rowCount === 0) return res.status(404).send("Worker not found");
        
        const emp = empQuery.rows[0];
        const distance = calculateDistance(user_lat, user_lng, parseFloat(emp.w_lat), parseFloat(emp.w_lng));
        
        let status = 'SUCCESS', reason = 'Verified';

        // Security Logic
        if (distance > emp.radius_meters) { 
            status = 'BLOCKED'; 
            reason = 'Location Outside Ward'; 
        } else if (face_score < 0.8) { 
            status = 'BLOCKED'; 
            reason = 'Face Identity Mismatch'; 
        }

        // Log Attendance
        await db.query(`
            INSERT INTO attendance_logs (emp_id, lat, lng, status, face_match_score, fail_reason) 
            VALUES ($1, $2, $3, $4, $5, $6)`, 
            [employee_id, user_lat, user_lng, status, face_score, reason]
        );

        if (status === 'SUCCESS') {
            await db.query('UPDATE employees SET attendance_count = attendance_count + 1, integrity_score = LEAST(integrity_score + 0.1, 100) WHERE id = $1', [employee_id]);
            res.json({ status: "SUCCESS", message: "Attendance Marked Successfully!" });
        } else {
            await db.query('UPDATE employees SET integrity_score = GREATEST(integrity_score - 0.5, 0) WHERE id = $1', [employee_id]);
            res.status(403).json({ status: "BLOCKED", reason });
        }
    } catch (e) { res.status(500).send(e.message); }
});

// --- 4. RANDOM PING SYSTEM (ENHANCED) ---

// Trigger: Supervisor sends a random presence check
app.post('/api/ping/trigger', async (req, res) => {
    const { employee_id } = req.body;
    try {
        await db.query('INSERT INTO ping_logs (emp_id, status) VALUES ($1, $2)', [employee_id, 'PENDING']);
        await db.query('UPDATE employees SET is_ping_active = TRUE WHERE id = $1', [employee_id]);
        res.json({ message: "Ping triggered successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Status: Worker App polls this to check if a ping is active
app.get('/api/ping/status/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT is_ping_active FROM employees WHERE id = $1", [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Worker not found" });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Respond: Worker answers the ping
app.post('/api/ping/respond', async (req, res) => {
    const { employee_id, user_lat, user_lng } = req.body;
    try {
        const empQuery = await db.query(`
            SELECT e.*, w.lat as w_lat, w.lng as w_lng, w.radius_meters 
            FROM employees e 
            JOIN wards w ON e.ward_id = w.id 
            WHERE e.id = $1`, [employee_id]);
        
        const emp = empQuery.rows[0];
        const distance = calculateDistance(user_lat, user_lng, parseFloat(emp.w_lat), parseFloat(emp.w_lng));

        if (distance <= emp.radius_meters) {
            await db.query("UPDATE ping_logs SET responded_at = NOW(), status = 'SUCCESS' WHERE emp_id = $1 AND status = 'PENDING'", [employee_id]);
            await db.query('UPDATE employees SET is_ping_active = FALSE, integrity_score = LEAST(integrity_score + 0.5, 100) WHERE id = $1', [employee_id]);
            res.json({ status: "SUCCESS", message: "Presence Verified!" });
        } else {
            await db.query("UPDATE ping_logs SET status = 'FAILED' WHERE emp_id = $1 AND status = 'PENDING'", [employee_id]);
            await db.query('UPDATE employees SET is_ping_active = FALSE, integrity_score = GREATEST(integrity_score - 2.0, 0) WHERE id = $1', [employee_id]);
            res.status(403).json({ status: "FAILED", message: "Verification Failed: Location Outside Ward" });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 5. SALARY & FINANCIAL INTEGRITY ---

// Release: Supervisor triggers salary generation and OTP
app.post('/api/salary/release', async (req, res) => {
    const { employee_id } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        await db.query('UPDATE employees SET current_otp = $1 WHERE id = $2', [otp, employee_id]);
        // Insert into ledger (status starts as PENDING)
        await db.query(`
            INSERT INTO salary_ledger (emp_id, amount, month_year, status) 
            SELECT id, base_salary, $1, 'PENDING' FROM employees WHERE id = $2`, 
            ['Jan-2026', employee_id]
        );
        res.json({ message: "Salary released!", otp_hint: otp });
    } catch (err) { res.status(500).send(err.message); }
});

// Verify: Worker enters OTP to release the funds
app.post('/api/salary/verify', async (req, res) => {
    const { employee_id, otp } = req.body;
    try {
        const result = await db.query('SELECT current_otp FROM employees WHERE id = $1', [employee_id]);
        if (result.rows[0].current_otp === otp) {
            await db.query("UPDATE salary_ledger SET status = 'VERIFIED', verified_at = NOW() WHERE emp_id = $1 AND status = 'PENDING'", [employee_id]);
            await db.query('UPDATE employees SET current_otp = NULL WHERE id = $1', [employee_id]);
            res.json({ status: "PAID", message: "Salary Credited Successfully!" });
        } else {
            res.status(401).json({ message: "Invalid Security OTP" });
        }
    } catch (err) { res.status(500).send(err.message); }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`MCD Engine active on port ${PORT}`);
});