const AuditLog = require('../models/AuditLog');

const logAction = async (req, documentId, action, userId = null) => {
    try {
        await AuditLog.create({
            documentId,
            userId,
            action,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
    } catch (error) {
        console.log('Audit log error:', error.message);
    }
};

module.exports = logAction;