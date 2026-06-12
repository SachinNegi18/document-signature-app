const express = require('express');
const router = express.Router();
const Signature = require('../models/Signature');
const auth = require('../middleware/auth');

// SAVE SIGNATURE POSITION
router.post('/', auth, async (req, res) => {
    try {
        const { documentId, x, y, page } = req.body;

        const signature = await Signature.create({
            documentId,
            userId: req.user.userId,
            x,
            y,
            page: page || 1
        });

        res.status(201).json({ message: 'Signature position saved', signature });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// GET SIGNATURES FOR A DOCUMENT
router.get('/:documentId', auth, async (req, res) => {
    try {
        const signatures = await Signature.find({ documentId: req.params.documentId });
        res.json(signatures);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;