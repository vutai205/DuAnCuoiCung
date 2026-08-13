const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

// @desc    Get all movies
// @route   GET /api/movies
exports.getMovies = async (req, res) => {
    try {
        const movies = await Movie.find({});
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
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

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res) => {
    try {
        const { title, description, duration, genre, genres, format, status, releaseDate, poster } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Tên phim không được để trống!' });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ message: 'Mô tả phim không được để trống!' });
        }
        
        let finalGenres = [];
        if (Array.isArray(genres) && genres.length > 0) {
            finalGenres = genres;
        } else if (genre && typeof genre === 'string') {
            finalGenres = genre.split(',').map(g => g.trim()).filter(Boolean);
        }

        if (finalGenres.length === 0) {
            return res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 thể loại phim!' });
        }

        if (!duration || Number(duration) <= 0) {
            return res.status(400).json({ message: 'Thời lượng phim phải lớn hơn 0 phút!' });
        }
        if (!releaseDate) {
            return res.status(400).json({ message: 'Ngày khởi chiếu không được để trống!' });
        }
        if (!poster || !poster.trim()) {
            return res.status(400).json({ message: 'Hình ảnh / Poster phim không được để trống!' });
        }

        const movieData = {
            ...req.body,
            genres: finalGenres,
            genre: finalGenres.join(', '),
            format: format || '2D',
            status: status || 'now_showing'
        };

        const movie = new Movie(movieData);
        const createdMovie = await movie.save();
        res.status(201).json(createdMovie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Phim không tồn tại!' });
        }

        const { title, description, duration, genre, genres, format, status, releaseDate, poster } = req.body;

        if (title !== undefined && (!title || !title.trim())) {
            return res.status(400).json({ message: 'Tên phim không được để trống!' });
        }
        if (description !== undefined && (!description || !description.trim())) {
            return res.status(400).json({ message: 'Mô tả phim không được để trống!' });
        }
        
        let finalGenres = movie.genres;
        if (Array.isArray(genres)) {
            finalGenres = genres;
        } else if (genre && typeof genre === 'string') {
            finalGenres = genre.split(',').map(g => g.trim()).filter(Boolean);
        }

        if (duration !== undefined && (!duration || Number(duration) <= 0)) {
            return res.status(400).json({ message: 'Thời lượng phim phải lớn hơn 0 phút!' });
        }
        if (releaseDate !== undefined && !releaseDate) {
            return res.status(400).json({ message: 'Ngày khởi chiếu không được để trống!' });
        }
        if (poster !== undefined && (!poster || !poster.trim())) {
            return res.status(400).json({ message: 'Hình ảnh / Poster phim không được để trống!' });
        }

        Object.assign(movie, req.body);
        if (finalGenres && finalGenres.length > 0) {
            movie.genres = finalGenres;
            movie.genre = finalGenres.join(', ');
        }

        const updatedMovie = await movie.save();
        res.json(updatedMovie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Phim không tồn tại!' });
        }

        const showtimes = await Showtime.find({ movie: movie._id });
        const now = new Date();

        for (const st of showtimes) {
            const start = new Date(st.startTime);
            const end = st.endTime ? new Date(st.endTime) : start;

            if (start <= now && end >= now) {
                return res.status(400).json({ message: `Không thể xóa phim "${movie.title}" vì đang có suất chiếu diễn ra!` });
            }

            const activeBookingsCount = await Booking.countDocuments({
                showtime: st._id,
                status: { $ne: 'cancelled' }
            });

            if (activeBookingsCount > 0) {
                return res.status(400).json({ message: `Không thể xóa phim "${movie.title}" vì đã có khách mua vé (${activeBookingsCount} đơn vé)!` });
            }
        }

        await movie.deleteOne();
        res.json({ message: 'Đã xóa phim thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
