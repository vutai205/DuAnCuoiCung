const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    poster: { type: String }, // URL or /uploads/path
    genre: { type: String }, // Chuỗi thể loại phục vụ tương thích cũ
    genres: [{ type: String }], // Mảng nhiều thể loại
    format: { type: String, default: '2D' }, // 2D, 3D, IMAX 3D, 4DX
    status: { 
        type: String, 
        enum: ['now_showing', 'coming_soon', 'ended'], 
        default: 'now_showing' 
    },
    releaseDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
