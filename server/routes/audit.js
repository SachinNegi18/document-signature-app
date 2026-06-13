const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

// GET AUDIT TRAIL FOR A DOCUMENT
router.get('/:docId', auth, async (req, res) => {
    try {
        const logs = await AuditLog.find({ documentId: req.params.docId }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;