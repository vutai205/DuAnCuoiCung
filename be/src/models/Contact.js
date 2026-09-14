const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    topic: {
        type: String,
        required: true,
        default: 'ticket_support'
    },
    message: {
        type: String,
        required: true
    },
    adminReply: {
        type: String,
        default: null
    },
    adminReplyAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'resolved'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', ContactSchema);
