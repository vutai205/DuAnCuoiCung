const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    // seatLayout could be an array of seat names like ['A1', 'A2', 'A3', ..., 'E10']
    seatLayout: [{ type: String, required: true }]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
