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
        console.log("   DILLI DRISHTI v4.5 CORE ENGINE      ");
        console.log("   STATUS: STRICT GOVERNANCE ACTIVE    ");
        console.log("   INTEGRITY LEDGER: ENCRYPTED         ");
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Critical: Database Init Failed ->", err);
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

// --- 2. AUTH & PROFILE ROUTES (NEW & DYNAMIC) ---

// Get Individual Worker Profile for WorkerApp.jsx
app.get('/api/worker/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT e.id, e.name, e.role, e.integrity_score, e.base_salary, w.ward_name 
            FROM employees e 
            JOIN wards w ON e.ward_id = w.id 
            WHERE e.id = $1`, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Employee not found in registry" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Profile Fetch Error:", err);
        res.status(500).json({ error: "Mainframe Connection Error" });
    }
});

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

        if (empQuery.rowCount === 0) return res.status(404).json({ reason: "Worker not found" });
        
        const emp = empQuery.rows[0];
        const distance = calculateDistance(user_lat, user_lng, parseFloat(emp.w_lat), parseFloat(emp.w_lng));
        
        let status = 'SUCCESS', reason = 'Verified via Geofence & AI';

        // Triple-Lock Logic
        if (distance > emp.radius_meters) { 
            status = 'BLOCKED'; 
            reason = 'Fraud Alert: Outside Ward Boundary'; 
        } else if (face_score < 0.8) { 
            status = 'BLOCKED'; 
            reason = 'Identity Mismatch: Face Scan Failed'; 
        }

        // Log Attendance into Immutable Ledger
        await db.query(`
            INSERT INTO attendance_logs (emp_id, lat, lng, status, face_match_score, fail_reason) 
            VALUES ($1, $2, $3, $4, $5, $6)`, 
            [employee_id, user_lat, user_lng, status, face_score, reason]
        );

        if (status === 'SUCCESS') {
            await db.query(`
                UPDATE employees 
                SET attendance_count = attendance_count + 1, 
                    integrity_score = LEAST(integrity_score + 0.1, 100) 
                WHERE id = $1`, [employee_id]);
            res.json({ status: "SUCCESS", message: "Presence Verified. Records Locked." });
        } else {
            // Penalize Integrity Score for Fraud Attempt
            await db.query(`
                UPDATE employees 
                SET integrity_score = GREATEST(integrity_score - 1.5, 0) 
                WHERE id = $1`, [employee_id]);
            res.status(403).json({ status: "BLOCKED", reason });
        }
    } catch (e) { 
        console.error("Attendance Error:", e);
        res.status(500).json({ error: "Attendance Logic Failure" });
    }
});

// --- 4. RANDOM PING SYSTEM ---

// Status: Worker App calls this to check if a ping is active
app.get('/api/ping/status/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT is_ping_active FROM employees WHERE id = $1", [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Worker not found" });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Respond: Worker answers the random ping
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
            res.json({ status: "SUCCESS", message: "Integrity Verified!" });
        } else {
            await db.query("UPDATE ping_logs SET status = 'FAILED' WHERE emp_id = $1 AND status = 'PENDING'", [employee_id]);
            await db.query('UPDATE employees SET is_ping_active = FALSE, integrity_score = GREATEST(integrity_score - 2.5, 0) WHERE id = $1', [employee_id]);
            res.status(403).json({ status: "FAILED", message: "Ping Failed: Abnormal Location" });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 5. SALARY & FINANCIAL INTEGRITY (OTP BASED) ---

// Verify: Worker enters OTP to release the funds from MCD Treasury
app.post('/api/salary/verify', async (req, res) => {
    const { employee_id, otp } = req.body;
    try {
        const result = await db.query('SELECT current_otp FROM employees WHERE id = $1', [employee_id]);
        
        if (result.rowCount > 0 && result.rows[0].current_otp === otp) {
            await db.query(`
                UPDATE salary_ledger 
                SET status = 'VERIFIED', verified_at = NOW() 
                WHERE emp_id = $1 AND status = 'PENDING'`, [employee_id]);
            
            await db.query('UPDATE employees SET current_otp = NULL WHERE id = $1', [employee_id]);
            
            res.json({ status: "PAID", message: "MCD Treasury: Salary Disbursed to Bank." });
        } else {
            res.status(401).json({ message: "Security Violation: Invalid OTP" });
        }
    } catch (err) { 
        console.error("Salary Verification Error:", err);
        res.status(500).json({ error: "Treasury Connection Failed" });
    }
});

// Trigger: Supervisor releases salary (Used for Testing/Demo)
app.post('/api/salary/release', async (req, res) => {
    const { employee_id } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        await db.query('UPDATE employees SET current_otp = $1 WHERE id = $2', [otp, employee_id]);
        await db.query(`
            INSERT INTO salary_ledger (emp_id, amount, month_year, status) 
            SELECT id, base_salary, $1, 'PENDING' FROM employees WHERE id = $2`, 
            ['Jan-2026', employee_id]
        );
        res.json({ message: "Salary Generated", otp_hint: otp });
    } catch (err) { res.status(500).send(err.message); }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[SYSTEM] Dilli Drishti Engine listening on port ${PORT}`);
});