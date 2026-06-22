const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    seatLayout: [{
        seatName: { type: String, required: true },
        type: { type: String, enum: ['regular', 'vip', 'couple'], default: 'regular' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
