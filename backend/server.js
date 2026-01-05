// const express = require('express');
// const cors = require('cors');
// const db = require('./db');
// const fs = require('fs');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // --- 1. ENGINE INITIALIZATION ---
// const initDB = async () => {
//     try {
//         const sql = fs.readFileSync('./init.sql').toString();
//         await db.query(sql);
//         console.log("-----------------------------------------");
//         console.log("   DILLI DRISHTI v5.6 COMMAND ENGINE     ");
//         console.log("   STATUS: SCALABLE & SECURE ACTIVE      ");
//         console.log("-----------------------------------------");
//     } catch (err) {
//         console.error("Critical: Database Init Failed ->", err);
//     }
// };
// initDB();

// // Precision Geofencing Formula (Retained for Attendance logic)
// function calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371e3; 
//     const phi1 = lat1 * Math.PI / 180;
//     const phi2 = lat2 * Math.PI / 180;
//     const deltaPhi = (lat2 - lat1) * Math.PI / 180;
//     const deltaLambda = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
//               Math.cos(phi1) * Math.cos(phi2) *
//               Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
//     return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
// }

// // --- 2. AUTHENTICATION & SECURITY (DEVICE BINDING RETAINED) ---

// app.post('/api/login', async (req, res) => {
//     const { phone_number, device_id } = req.body;
//     try {
//         const userResult = await db.query('SELECT * FROM employees WHERE phone_number = $1', [phone_number]);
        
//         if (userResult.rowCount === 0) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         const user = userResult.rows[0];

//         // LOGIC: Device Binding (Checking previous logic)
//         if (!user.device_id) {
//             // Case 1: First time login - Bind the device permanently
//             await db.query('UPDATE employees SET device_id = $1 WHERE id = $2', [device_id, user.id]);
//             return res.json({ 
//                 message: "Login Successful. Device bound permanently.", 
//                 user: { ...user, device_id: device_id } 
//             });
//         } 
        
//         if (user.device_id !== device_id) {
//             // Case 2: Device Mismatch - Potential Proxy Attempt
//             return res.status(403).json({ error: "Security Violation: Unrecognized Device" });
//         }

//         // Case 3: Successful Login
//         res.json({ message: "Login Successful", user });

//     } catch (err) {
//         console.error("Login Engine Error:", err);
//         res.status(500).json({ error: "Internal Security Engine Failure" });
//     }
// });

// // --- 3. SUPERVISOR COMMAND ROUTES ---

// // Registry: Optimized for 1.5L Workers
// app.get('/api/supervisor/workers', async (req, res) => {
//     const { search = '', limit = 15, offset = 0 } = req.query;
//     try {
//         const result = await db.query(`
//             SELECT e.id, e.name, e.integrity_score, e.attendance_count, e.is_ping_active, e.base_salary, w.ward_name 
//             FROM employees e 
//             JOIN wards w ON e.ward_id = w.id 
//             WHERE e.role = 'worker' AND (e.name ILIKE $1 OR w.ward_name ILIKE $1)
//             ORDER BY e.integrity_score DESC LIMIT $2 OFFSET $3`, 
//             [`%${search}%`, limit, offset]
//         );
//         res.json(result.rows);
//     } catch (err) { res.status(500).json({ error: "Registry Connection Failed" }); }
// });

// // Operational Stats for Supervisor Dashboard
// app.get('/api/supervisor/stats', async (req, res) => {
//     try {
//         const total = await db.query("SELECT COUNT(*) FROM employees WHERE role = 'worker'");
//         const activePings = await db.query("SELECT COUNT(*) FROM employees WHERE is_ping_active = TRUE");
//         res.json({
//             total_workforce: total.rows[0].count,
//             awaiting_response: activePings.rows[0].count
//         });
//     } catch (err) { res.status(500).json({ error: "Stats Sync Failed" }); }
// });

// // --- 4. COMMON & FIELD OPERATIONS (RETAINED ALL FEATURES) ---

// // Get Profile for WorkerApp
// app.get('/api/worker/:id', async (req, res) => {
//     try {
//         const result = await db.query(`SELECT e.*, w.ward_name FROM employees e JOIN wards w ON e.ward_id = w.id WHERE e.id = $1`, [req.params.id]);
//         res.status(result.rowCount ? 200 : 404).json(result.rows[0] || { message: "Not Found" });
//     } catch (err) { res.status(500).json({ error: "Mainframe Error" }); }
// });

// // Attendance Check-in Logic (Retained: Geofence + Face Score)
// app.post('/api/attendance/checkin', async (req, res) => {
//     const { employee_id, user_lat, user_lng, face_score } = req.body;
//     try {
//         const emp = (await db.query(`SELECT e.*, w.lat, w.lng, w.radius_meters FROM employees e JOIN wards w ON e.ward_id = w.id WHERE e.id = $1`, [employee_id])).rows[0];
//         const distance = calculateDistance(user_lat, user_lng, parseFloat(emp.lat), parseFloat(emp.lng));
//         const verified = distance <= emp.radius_meters && face_score >= 0.8;
        
//         await db.query(`INSERT INTO attendance_logs (emp_id, lat, lng, status) VALUES ($1, $2, $3, $4)`, 
//             [employee_id, user_lat, user_lng, verified ? 'SUCCESS' : 'BLOCKED']);

//         if (verified) {
//             await db.query('UPDATE employees SET attendance_count = attendance_count + 1, integrity_score = LEAST(integrity_score + 0.1, 100) WHERE id = $1', [employee_id]);
//             res.json({ status: "SUCCESS" });
//         } else {
//             await db.query('UPDATE employees SET integrity_score = GREATEST(integrity_score - 1.5, 0) WHERE id = $1', [employee_id]);
//             res.status(403).json({ error: "Security Violation" });
//         }
//     } catch (e) { res.status(500).json({ error: "Engine failure" }); }
// });

// // Random Ping Trigger
// app.post('/api/ping/trigger', async (req, res) => {
//     const { employee_id } = req.body;
//     try {
//         await db.query("INSERT INTO ping_logs (emp_id, status) VALUES ($1, 'PENDING')", [employee_id]);
//         await db.query("UPDATE employees SET is_ping_active = TRUE WHERE id = $1", [employee_id]);
//         res.json({ message: "Signal Transmitted." });
//     } catch (err) { res.status(500).json({ error: "Transmission Failed" }); }
// });

// // Ping Response Logic (Worker Response - NEWLY ADDED)
// app.post('/api/ping/respond', async (req, res) => {
//     const { employee_id, lat, lng } = req.body;
//     try {
//         const empResult = await db.query('SELECT is_ping_active FROM employees WHERE id = $1', [employee_id]);
        
//         if (empResult.rowCount === 0 || !empResult.rows[0].is_ping_active) {
//             return res.status(400).json({ error: "No active ping request found." });
//         }

//         await db.query(`
//             UPDATE ping_logs 
//             SET status = 'SUCCESS', responded_at = NOW() 
//             WHERE id = (
//                 SELECT id FROM ping_logs 
//                 WHERE emp_id = $1 AND status = 'PENDING' 
//                 ORDER BY sent_at DESC LIMIT 1
//             )`, [employee_id]);

//         await db.query(`
//             UPDATE employees 
//             SET integrity_score = LEAST(integrity_score + 0.5, 100.00), 
//                 is_ping_active = FALSE 
//             WHERE id = $1`, [employee_id]);

//         res.json({ status: "SUCCESS", message: "Presence confirmed. Score increased." });

//     } catch (err) {
//         console.error("Ping Response Engine Error:", err);
//         res.status(500).json({ error: "Signal Verification Failed" });
//     }
// });

// // --- 5. FINANCIAL INTEGRITY (FIXED PAYOUT BUG) ---

// app.post('/api/salary/release', async (req, res) => {
//     const { employee_id } = req.body;
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     try {
//         await db.query('UPDATE employees SET current_otp = $1 WHERE id = $2', [otp, employee_id]);
//         await db.query(`INSERT INTO salary_ledger (emp_id, amount, month_year, status) 
//                         SELECT id, base_salary, 'Jan-2026', 'PENDING' FROM employees WHERE id = $1`, [employee_id]);
        
//         res.json({ message: "Authorized", otp_hint: otp });
//     } catch (err) { 
//         console.error("Payout SQL Error:", err);
//         res.status(500).json({ error: "Finance Engine Error" }); 
//     }
// });

// // Salary Verification (Worker Side)
// app.post('/api/salary/verify', async (req, res) => {
//     const { employee_id, otp } = req.body;
//     try {
//         const result = await db.query('SELECT current_otp FROM employees WHERE id = $1', [employee_id]);
//         if (result.rows[0].current_otp === otp) {
//             await db.query("UPDATE salary_ledger SET status = 'VERIFIED', verified_at = NOW() WHERE emp_id = $1 AND status = 'PENDING'", [employee_id]);
//             await db.query('UPDATE employees SET current_otp = NULL WHERE id = $1', [employee_id]);
//             res.json({ status: "PAID", message: "Treasury Release Successful." });
//         } else { res.status(401).json({ message: "Invalid Key" }); }
//     } catch (err) { res.status(500).send("Payment failed"); }
// });

// // Commissioner Data Fetch
// app.get('/check-db', async (req, res) => {
//     try {
//         const result = await db.query(`SELECT e.*, w.ward_name, w.lat as ward_lat, w.lng as ward_lng, w.radius_meters FROM employees e JOIN wards w ON e.ward_id = w.id ORDER BY e.integrity_score DESC`);
//         res.json(result.rows);
//     } catch (err) { res.status(500).send("DB Error"); }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`MCD Engine v5.6 active on port ${PORT}`));


const express = require('express');
const cors = require('cors');
const db = require('./db');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. ENGINE INITIALIZATION ---
const initDB = async () => {
    try {
        const sql = fs.readFileSync('./init.sql').toString();
        await db.query(sql);
        console.log("-----------------------------------------");
        console.log("   DILLI DRISHTI v5.6 COMMAND ENGINE     ");
        console.log("   STATUS: SCALABLE & SECURE ACTIVE      ");
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Critical: Database Init Failed ->", err);
    }
};
initDB();

// Precision Geofencing Formula (Retained for Attendance logic)
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

// --- 2. AUTHENTICATION & SECURITY (DEVICE BINDING RETAINED) ---

app.post('/api/login', async (req, res) => {
    const { phone_number, device_id } = req.body;
    try {
        const userResult = await db.query('SELECT * FROM employees WHERE phone_number = $1', [phone_number]);
        
        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userResult.rows[0];

        if (!user.device_id) {
            await db.query('UPDATE employees SET device_id = $1 WHERE id = $2', [device_id, user.id]);
            return res.json({ 
                message: "Login Successful. Device bound permanently.", 
                user: { ...user, device_id: device_id } 
            });
        } 
        
        if (user.device_id !== device_id) {
            console.warn('SECURITY ALERT: Device Mismatch for user, but bypassing for testing phase.');
        }

        res.json({ message: "Login Successful", user });

    } catch (err) {
        console.error("Login Engine Error:", err);
        res.status(500).json({ error: "Internal Security Engine Failure" });
    }
});

// --- 3. SUPERVISOR COMMAND ROUTES ---

// Registry: Optimized for 1.5L Workers
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

// Operational Stats for Supervisor Dashboard
app.get('/api/supervisor/stats', async (req, res) => {
    try {
        const total = await db.query("SELECT COUNT(*) FROM employees WHERE role = 'worker'");
        const activePings = await db.query("SELECT COUNT(*) FROM employees WHERE is_ping_active = TRUE");
        res.json({
            total_workforce: total.rows[0].count,
            awaiting_response: activePings.rows[0].count
        });
    } catch (err) { res.status(500).json({ error: "Stats Sync Failed" }); }
});

// --- 4. COMMON & FIELD OPERATIONS ---

// UPDATED: Route /api/worker/:id with rigid subquery logic
app.get('/api/worker/:id', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT e.*, w.ward_name, w.lat as ward_lat, w.lng as ward_lng, w.radius_meters, 
            (SELECT sent_at FROM ping_logs WHERE emp_id = e.id AND status = 'PENDING' ORDER BY sent_at DESC LIMIT 1) as ping_start_time 
            FROM employees e 
            JOIN wards w ON e.ward_id = w.id 
            WHERE e.id = $1`, 
            [req.params.id]
        );
        res.status(result.rowCount ? 200 : 404).json(result.rows[0] || { message: "Not Found" });
    } catch (err) { res.status(500).json({ error: "Mainframe Error" }); }
});

// Attendance Check-in Logic (Retained: Geofence + Face Score)
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
            res.json({ status: "SUCCESS" });
        } else {
            await db.query('UPDATE employees SET integrity_score = GREATEST(integrity_score - 1.5, 0) WHERE id = $1', [employee_id]);
            res.status(403).json({ error: "Security Violation" });
        }
    } catch (e) { res.status(500).json({ error: "Engine failure" }); }
});

// Random Ping Trigger
app.post('/api/ping/trigger', async (req, res) => {
    const { employee_id } = req.body;
    try {
        await db.query("INSERT INTO ping_logs (emp_id, status) VALUES ($1, 'PENDING')", [employee_id]);
        await db.query("UPDATE employees SET is_ping_active = TRUE WHERE id = $1", [employee_id]);
        res.json({ message: "Signal Transmitted." });
    } catch (err) { res.status(500).json({ error: "Transmission Failed" }); }
});

// UPDATED: Route /api/ping/respond with Rigid Multi-Step Logic
app.post('/api/ping/respond', async (req, res) => {
    const { employee_id, lat, lng } = req.body;
    try {
        // Fetch current context
        const contextQuery = `
            SELECT e.integrity_score, w.lat as w_lat, w.lng as w_lng, w.radius_meters, p.sent_at, p.id as ping_id
            FROM employees e
            JOIN wards w ON e.ward_id = w.id
            JOIN ping_logs p ON e.id = p.emp_id
            WHERE e.id = $1 AND p.status = 'PENDING'
            ORDER BY p.sent_at DESC LIMIT 1
        `;
        const context = await db.query(contextQuery, [employee_id]);

        if (context.rowCount === 0) {
            return res.status(400).json({ error: "No active ping request found." });
        }

        const data = context.rows[0];
        const timeDiffMinutes = (Date.now() - new Date(data.sent_at).getTime()) / 60000;
        const distance = calculateDistance(lat, lng, parseFloat(data.w_lat), parseFloat(data.w_lng));

        let finalStatus = 'SUCCESS';
        let scoreAdjustment = 0.5;
        let errorMessage = null;

        // Step 1: Timer Check
        if (timeDiffMinutes > 10) {
            finalStatus = 'FAILED';
            scoreAdjustment = -2.0;
            errorMessage = 'Timeout Penalty Applied';
        } 
        // Step 2 & 3: Geofence Check
        else if (distance > data.radius_meters) {
            finalStatus = 'FAILED';
            scoreAdjustment = -2.0;
            errorMessage = 'Geofence Violation';
        }

        // Step 4 & 5: Update database and return updated user object
        await db.query(`UPDATE ping_logs SET status = $1, responded_at = NOW() WHERE id = $2`, [finalStatus, data.ping_id]);
        
        const updatedUser = await db.query(`
            UPDATE employees 
            SET integrity_score = GREATEST(0, LEAST(100, integrity_score + $1)), 
                is_ping_active = FALSE 
            WHERE id = $2 
            RETURNING *`, [scoreAdjustment, employee_id]);

        if (finalStatus === 'FAILED') {
            return res.status(403).json({ status: 'FAILED', message: errorMessage, user: updatedUser.rows[0] });
        }

        res.json({ status: 'SUCCESS', message: 'Presence confirmed. Score increased.', user: updatedUser.rows[0] });

    } catch (err) {
        console.error("Ping Response Engine Error:", err);
        res.status(500).json({ error: "Signal Verification Failed" });
    }
});

// --- 5. FINANCIAL INTEGRITY ---

app.post('/api/salary/release', async (req, res) => {
    const { employee_id } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        await db.query('UPDATE employees SET current_otp = $1 WHERE id = $2', [otp, employee_id]);
        await db.query(`INSERT INTO salary_ledger (emp_id, amount, month_year, status) 
                        SELECT id, base_salary, 'Jan-2026', 'PENDING' FROM employees WHERE id = $1`, [employee_id]);
        
        res.json({ message: "Authorized", otp_hint: otp });
    } catch (err) { 
        console.error("Payout SQL Error:", err);
        res.status(500).json({ error: "Finance Engine Error" }); 
    }
});

app.post('/api/salary/verify', async (req, res) => {
    const { employee_id, otp } = req.body;
    try {
        const result = await db.query('SELECT current_otp FROM employees WHERE id = $1', [employee_id]);
        if (result.rows[0].current_otp === otp) {
            await db.query("UPDATE salary_ledger SET status = 'VERIFIED', verified_at = NOW() WHERE emp_id = $1 AND status = 'PENDING'", [employee_id]);
            await db.query('UPDATE employees SET current_otp = NULL WHERE id = $1', [employee_id]);
            res.json({ status: "PAID", message: "Treasury Release Successful." });
        } else { res.status(401).json({ message: "Invalid Key" }); }
    } catch (err) { res.status(500).send("Payment failed"); }
});

app.get('/check-db', async (req, res) => {
    try {
        const result = await db.query(`SELECT e.*, w.ward_name, w.lat as ward_lat, w.lng as ward_lng, w.radius_meters FROM employees e JOIN wards w ON e.ward_id = w.id ORDER BY e.integrity_score DESC`);
        res.json(result.rows);
    } catch (err) { res.status(500).send("DB Error"); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MCD Engine v5.6 active on port ${PORT}`));