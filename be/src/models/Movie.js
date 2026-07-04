const mongoose = require('mongoose');
const AGE_RATINGS = ['P', 'K', 'T13', 'T16', 'T18', 'C'];
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    poster: { type: String },
    genre: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    ageRating: {
        type: String,
        enum: AGE_RATINGS,
        default: 'P',
        required: true
    }
}, { timestamps: true });
module.exports = mongoose.model('Movie', movieSchema);
module.exports.AGE_RATINGS = AGE_RATINGS;
