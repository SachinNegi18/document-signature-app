const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const Signature = require('../models/Signature');
const Document = require('../models/Document');
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

// FINALIZE - EMBED SIGNATURE INTO PDF
router.post('/finalize', auth, async (req, res) => {
    try {
        const { documentId } = req.body;

        // Get the document
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Get the latest signature for this document
        const signature = await Signature.findOne({ documentId }).sort({ createdAt: -1 });
        if (!signature) {
            return res.status(404).json({ message: 'No signature found for this document' });
        }

        // Load the original PDF
        const existingPdfBytes = fs.readFileSync(document.filePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the page where the signature should go
        const pages = pdfDoc.getPages();
        const page = pages[signature.page - 1];

        // Embed signature text at the saved position
        page.drawText('Signed by ' + req.user.userId, {
            x: signature.x,
            y: page.getHeight() - signature.y,
            size: 14,
        });

        // Save the signed PDF
        const signedPdfBytes = await pdfDoc.save();
        const signedFileName = 'signed-' + document.filename;
        const signedFilePath = path.join('uploads', signedFileName);
        fs.writeFileSync(signedFilePath, signedPdfBytes);

        // Update document status
        document.status = 'signed';
        await document.save();

        // Update signature status
        signature.status = 'signed';
        await signature.save();

        res.json({
            message: 'PDF signed successfully',
            signedFilePath: signedFilePath.replace(/\\/g, '/')
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;