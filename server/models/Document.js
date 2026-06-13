const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'signed', 'rejected'],
        default: 'pending'
    },
    shareToken: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);