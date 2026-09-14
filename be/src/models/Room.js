const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: '2D Standard' },
    totalSeats: { type: Number, required: true },
    rowsCount: { type: Number, default: 8 },
    seatsPerRow: { type: Number, default: 10 },
    status: { type: String, enum: ['active', 'maintenance'], default: 'active' },
    seatLayout: [{
        seatName: { type: String, required: true },
        type: { type: String, enum: ['regular', 'vip', 'couple', 'maintenance'], default: 'regular' },
        status: { type: String, enum: ['active', 'maintenance'], default: 'active' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
