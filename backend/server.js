const express = require('express');
const cors = require('cors');
const db = require('./db');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. DB INITIALIZATION ---
const initDB = async () => {
    try {
        const sql = fs.readFileSync('./init.sql').toString();
        await db.query(sql);
        console.log("--- DILLI DRISHTI v4.0 FINAL LOADED ---");
    } catch (err) {
        console.error("Init Error:", err);
    }
};
initDB();

// Helper: Distance Calculator (Haversine)
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

// --- 2. DASHBOARD ROUTES (Updated for Map Support) ---
app.get('/check-db', async (req, res) => {
    try {
        // Updated Query: Selecting coordinates and radius for the Commissioner's Map
        const result = await db.query(`
            SELECT e.*, w.ward_name, w.lat, w.lng, w.radius_meters 
            FROM employees e 
            JOIN wards w ON e.ward_id = w.id
        `);
        res.json(result.rows);
    } catch (err) { 
        console.error("Dashboard Fetch Error:", err);
        res.status(500).send("DB Error"); 
    }
});

// --- 3. ATTENDANCE API (Triple-Lock) ---
app.post('/api/attendance/checkin', async (req, res) => {
    const { employee_id, user_lat, user_lng, face_score } = req.body;
    try {
        const empQuery = await db.query(`SELECT e.*, w.lat as w_lat, w.lng as w_lng, w.radius_meters FROM employees e JOIN wards w ON e.ward_id = w.id WHERE e.id = $1`, [employee_id]);
        if (empQuery.rowCount === 0) return res.status(404).send("Worker not found");
        
        const emp = empQuery.rows[0];
        const distance = calculateDistance(user_lat, user_lng, parseFloat(emp.w_lat), parseFloat(emp.w_lng));
        
        let status = 'SUCCESS', reason = 'Verified';
        if (distance > emp.radius_meters) { status = 'BLOCKED'; reason = 'Location Outside Ward'; }
        else if (face_score < 0.8) { status = 'BLOCKED'; reason = 'Face Identity Mismatch'; }

        await db.query('INSERT INTO attendance_logs (emp_id, lat, lng, status, face_match_score, fail_reason) VALUES ($1, $2, $3, $4, $5, $6)', [employee_id, user_lat, user_lng, status, face_score, reason]);

        if (status === 'SUCCESS') {
            await db.query('UPDATE employees SET attendance_count = attendance_count + 1, integrity_score = integrity_score + 0.1 WHERE id = $1', [employee_id]);
            res.json({ status: "SUCCESS", message: "Haazri Lag Gayi!" });
        } else {
            await db.query('UPDATE employees SET integrity_score = integrity_score - 0.5 WHERE id = $1', [employee_id]);
            res.status(403).json({ status: "BLOCKED", reason });
        }
    } catch (e) { res.status(500).send(e.message); }
});

// --- 4. RANDOM PING APIs ---
app.post('/api/ping/trigger', async (req, res) => {
    const { employee_id } = req.body;
    await db.query('INSERT INTO ping_logs (emp_id) VALUES ($1)', [employee_id]);
    await db.query('UPDATE employees SET is_ping_active = TRUE WHERE id = $1', [employee_id]);
    res.json({ message: "Ping Sent!" });
});

app.post('/api/ping/respond', async (req, res) => {
    const { employee_id, user_lat, user_lng } = req.body;
    const empQuery = await db.query(`SELECT e.*, w.lat as w_lat, w.lng as w_lng, w.radius_meters FROM employees e JOIN wards w ON e.ward_id = w.id WHERE e.id = $1`, [employee_id]);
    const emp = empQuery.rows[0];
    const distance = calculateDistance(user_lat, user_lng, parseFloat(emp.w_lat), parseFloat(emp.w_lng));

    if (distance <= emp.radius_meters) {
        await db.query('UPDATE ping_logs SET responded_at = NOW(), status = $1 WHERE emp_id = $2 AND status = $3', ['SUCCESS', employee_id, 'PENDING']);
        await db.query('UPDATE employees SET is_ping_active = FALSE, integrity_score = integrity_score + 0.5 WHERE id = $1', [employee_id]);
        res.json({ message: "Presence Verified!" });
    } else {
        await db.query('UPDATE employees SET is_ping_active = FALSE, integrity_score = integrity_score - 2.0 WHERE id = $1', [employee_id]);
        res.status(403).send("Out of Ward during ping!");
    }
});

// --- 5. SALARY INTEGRITY APIs ---
app.post('/api/salary/release', async (req, res) => {
    const { employee_id } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.query('UPDATE employees SET current_otp = $1 WHERE id = $2', [otp, employee_id]);
    await db.query('INSERT INTO salary_ledger (emp_id, amount, month_year) SELECT id, base_salary, $1 FROM employees WHERE id = $2', ['Jan-2026', employee_id]);
    res.json({ message: "Salary released!", otp_hint: otp });
});

app.post('/api/salary/verify', async (req, res) => {
    const { employee_id, user_otp } = req.body;
    const result = await db.query('SELECT current_otp FROM employees WHERE id = $1', [employee_id]);
    if (result.rows[0].current_otp === user_otp) {
        await db.query('UPDATE salary_ledger SET status = $1, verified_at = NOW() WHERE emp_id = $2 AND status = $3', ['VERIFIED', employee_id, 'PENDING']);
        await db.query('UPDATE employees SET current_otp = NULL WHERE id = $1', [employee_id]);
        res.json({ status: "PAID", message: "Verified!" });
    } else { res.status(401).send("Invalid OTP"); }
});

app.listen(5000, () => console.log("MCD Dilli Drishti Final Engine on 5000"));