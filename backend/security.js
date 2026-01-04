const crypto = require('crypto');

/**
 * Dilli Drishti Security Engine
 * Purpose: SHA-256 Hashing for Immutable Ledger
 */
const generateAuditHash = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

module.exports = { generateAuditHash };