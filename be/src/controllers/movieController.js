const Movie = require('../models/Movie');
const { MIN_AGE_BY_RATING, getMinAge } = require('../utils/ageRating');
exports.getMovies = async (req, res) => {
    try {
        const { ageRating, viewerAge } = req.query;
        const filter = {};
        if (ageRating) {
            filter.ageRating = ageRating;
        }
        if (viewerAge !== undefined && viewerAge !== '') {
            const age = Number(viewerAge);
            if (Number.isNaN(age) || age < 0) {
                return res.status(400).json({ message: 'Tuoi nguoi xem khong hop le' });
            }
            const allowedRatings = Object.keys(MIN_AGE_BY_RATING).filter(
                (rating) => age >= getMinAge(rating)
            );
            filter.ageRating = filter.ageRating
                ? { $in: allowedRatings.filter((r) => r === filter.ageRating) }
                : { $in: allowedRatings };
        }
        const movies = await Movie.find(filter).sort({ releaseDate: -1 });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createMovie = async (req, res) => {
    try {
        const movie = new Movie(req.body);
        const createdMovie = await movie.save();
        res.status(201).json(createdMovie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (movie) {
            Object.assign(movie, req.body);
            const updatedMovie = await movie.save();
            res.json(updatedMovie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (movie) {
            await movie.deleteOne();
            res.json({ message: 'Movie removed' });
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
