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
        console.log("   DILLI DRISHTI v5.5 COMMAND ENGINE     ");
        console.log("   STATUS: SCALABLE & SECURE ACTIVE      ");
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Critical: Database Init Failed ->", err);
    }
};
initDB();

// Precision Geofencing Formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// --- 2. REGISTRY & PROFILE ROUTES ---

// Supervisor: Paginated & Searchable (Optimized for 1.5L Workers)
app.get('/api/supervisor/workers', async (req, res) => {
    const { search = '', limit = 15, offset = 0 } = req.query;
    try {
        const result = await db.query(`
            SELECT e.id, e.name, e.integrity_score, e.attendance_count, e.is_ping_active, e.base_salary, w.ward_name 
            FROM employees e 
            JOIN wards w ON e.ward_id = w.id 
            WHERE e.role = 'worker' AND (e.name ILIKE $1 OR w.ward_name ILIKE $1)
            ORDER BY e.integrity_score DESC LIMIT $2 OFFSET $3`, 
            [`%${search}%`, limit, offset]
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: "Registry Connection Failed" }); }
});

// Worker: Individual Profile Fetch
app.get('/api/worker/:id', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT e.id, e.name, e.role, e.integrity_score, e.base_salary, w.ward_name 
            FROM employees e JOIN wards w ON e.ward_id = w.id WHERE e.id = $1`, [req.params.id]);
        res.status(result.rowCount ? 200 : 404).json(result.rows[0] || { message: "Not Found" });
    } catch (err) { res.status(500).json({ error: "Mainframe Error" }); }
});

// Commissioner: Global Data
app.get('/check-db', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT e.*, w.ward_name, w.lat as ward_lat, w.lng as ward_lng, w.radius_meters 
            FROM employees e JOIN wards w ON e.ward_id = w.id ORDER BY e.integrity_score DESC`);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: "Database Connection Failed" }); }
});

// --- 3. FIELD OPERATIONS LOGIC ---

// Attendance Punch with Geofence & AI Liveness check
app.post('/api/attendance/checkin', async (req, res) => {
    const { employee_id, user_lat, user_lng, face_score } = req.body;
    try {
        const emp = (await db.query(`SELECT e.*, w.lat, w.lng, w.radius_meters FROM employees e JOIN wards w ON e.ward_id = w.id WHERE e.id = $1`, [employee_id])).rows[0];
        const distance = calculateDistance(user_lat, user_lng, parseFloat(emp.lat), parseFloat(emp.lng));
        const verified = distance <= emp.radius_meters && face_score >= 0.8;
        
        await db.query(`INSERT INTO attendance_logs (emp_id, lat, lng, status) VALUES ($1, $2, $3, $4)`, 
            [employee_id, user_lat, user_lng, verified ? 'SUCCESS' : 'BLOCKED']);

        if (verified) {
            await db.query('UPDATE employees SET attendance_count = attendance_count + 1, integrity_score = LEAST(integrity_score + 0.1, 100) WHERE id = $1', [employee_id]);
            res.json({ status: "SUCCESS", message: "Presence Verified." });
        } else {
            await db.query('UPDATE employees SET integrity_score = GREATEST(integrity_score - 1.5, 0) WHERE id = $1', [employee_id]);
            res.status(403).json({ status: "BLOCKED", reason: "Geofence Violation" });
        }
    } catch (e) { res.status(500).json({ error: "Engine Failure" }); }
});

// Trigger Ping (Transmission Bug FIXED)
app.post('/api/ping/trigger', async (req, res) => {
    const { employee_id } = req.body;
    try {
        await db.query("INSERT INTO ping_logs (emp_id, status) VALUES ($1, 'PENDING')", [employee_id]);
        await db.query("UPDATE employees SET is_ping_active = TRUE WHERE id = $1", [employee_id]);
        res.json({ message: "Signal Transmitted." });
    } catch (err) { res.status(500).json({ error: "Transmission Failed" }); }
});

// Salary release and OTP gen
app.post('/api/salary/release', async (req, res) => {
    const { employee_id } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        await db.query('UPDATE employees SET current_otp = $1 WHERE id = $2', [otp, employee_id]);
        await db.query(`INSERT INTO salary_ledger (emp_id, amount, month_year, status) SELECT id, base_salary, 'Jan-2026', 'PENDING' FROM employees WHERE id = $2`, [employee_id]);
        res.json({ message: "Authorized", otp_hint: otp });
    } catch (err) { res.status(500).send("Auth Failure"); }
});

// Salary OTP verification
app.post('/api/salary/verify', async (req, res) => {
    const { employee_id, otp } = req.body;
    try {
        const result = await db.query('SELECT current_otp FROM employees WHERE id = $1', [employee_id]);
        if (result.rows[0].current_otp === otp) {
            await db.query("UPDATE salary_ledger SET status = 'VERIFIED', verified_at = NOW() WHERE emp_id = $1 AND status = 'PENDING'", [employee_id]);
            await db.query('UPDATE employees SET current_otp = NULL WHERE id = $1', [employee_id]);
            res.json({ status: "PAID", message: "Salary Disbursed." });
        } else { res.status(401).json({ message: "Invalid OTP" }); }
    } catch (err) { res.status(500).send("Payment Failed"); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`MCD Core Engine on port ${PORT}`));