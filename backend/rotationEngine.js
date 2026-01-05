const db = require('./db'); // UPDATED: Path fixed for flat directory structure
const crypto = require('crypto');

/**
 * DILLI DRISHTI - Nexus Breaker Algorithm (AR)
 * Purpose: Automatically shuffles employees after 3 years to prevent corruption networks.
 * Security: Every transfer is sealed with a SHA-256 Audit Hash.
 */
const executeRotation = async () => {
    try {
        // 1. Un employees ko dhundo jinhe current ward mein 3 saal (> 1095 din) ho gaye hain
        const overdueQuery = `
            SELECT e.id, e.name, e.ward_id 
            FROM employees e 
            WHERE e.role = 'worker' 
            AND (CURRENT_DATE - e.last_transfer_date) >= 1095
        `;
        const overdueResult = await db.query(overdueQuery);
        const workersToMove = overdueResult.rows;

        if (workersToMove.length === 0) {
            return { status: "OK", message: "MCD Personnel Registry: No personnel due for rotation.", transfers: [] };
        }

        // 2. Available wards fetch karo randomization ke liye
        const wardsResult = await db.query("SELECT id, ward_name FROM wards");
        const allWards = wardsResult.rows;

        const results = [];

        for (let worker of workersToMove) {
            // Naya ward purane ward se alag hona chahiye
            const availableWards = allWards.filter(w => w.id !== worker.ward_id);
            if (availableWards.length === 0) continue;

            const targetWard = availableWards[Math.floor(Math.random() * availableWards.length)];

            // 3. Database Update: Assign New Ward & Reset Transfer Date
            await db.query(`
                UPDATE employees 
                SET ward_id = $1, last_transfer_date = CURRENT_DATE 
                WHERE id = $2
            `, [targetWard.id, worker.id]);

            // 4. Create Immutable Audit Log with SHA-256
            const auditPayload = JSON.stringify({
                employee_id: worker.id,
                worker_name: worker.name,
                from_ward: worker.ward_id,
                to_ward: targetWard.id,
                execution_time: new Date().toISOString()
            });

            const auditHash = crypto.createHash('sha256').update(auditPayload).digest('hex');

            await db.query(`
                INSERT INTO audit_logs (action_type, record_id, payload, sha256_hash) 
                VALUES ($1, $2, $3, $4)
            `, ['SYSTEM_ROTATION', worker.id, auditPayload, auditHash]);

            results.push({
                worker: worker.name,
                old_ward: `Ward ID ${worker.ward_id}`,
                new_ward: targetWard.ward_name
            });
        }

        return { 
            status: "SUCCESS", 
            message: `Rotation complete. ${results.length} Nexus(es) broken.`, 
            transfers: results 
        };

    } catch (err) {
        console.error("CRITICAL: Rotation Engine Failure ->", err);
        throw err;
    }
};

module.exports = { executeRotation };