const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    startTime: { type: Date, required: true },
    ticketPrice: { type: Number, required: true },
    vipSurcharge: { type: Number, default: 15000 },
    coupleSurcharge: { type: Number, default: 20000 },
    status: { type: String, enum: ['upcoming', 'ongoing', 'ended', 'cancelled'], default: 'upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('Showtime', showtimeSchema);
