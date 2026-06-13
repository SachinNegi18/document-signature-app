const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const logAction = require('../middleware/logAction');

// Setup Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

// Only allow PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

// UPLOAD PDF
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        const document = await Document.create({
            userId: req.user.userId,
            filename: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            size: req.file.size
        });

        await logAction(req, document._id, 'Document uploaded', req.user.userId);

        res.status(201).json({ message: 'File uploaded successfully', document });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// GET ALL DOCUMENTS FOR A USER
router.get('/', auth, async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.user.userId });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// ACCESS DOCUMENT VIA SHARE TOKEN (NO AUTH NEEDED)
router.get('/public/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        const document = await Document.findById(decoded.documentId);

        if (!document || document.shareToken !== req.params.token) {
            return res.status(404).json({ message: 'Invalid or expired link' });
        }

        await logAction(req, document._id, 'Document viewed via share link');

        res.json(document);

    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired link' });
    }
});

// GET SINGLE DOCUMENT
router.get('/:id', auth, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// GENERATE SHARE LINK
router.post('/:id/share', auth, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const shareToken = jwt.sign(
            { documentId: document._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        document.shareToken = shareToken;
        await document.save();

        res.json({
            message: 'Share link generated',
            shareLink: `http://localhost:5173/public-sign/${shareToken}`
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;