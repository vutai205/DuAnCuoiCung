const Review = require('../models/Review');
const Movie = require('../models/Movie');

exports.getMovieReviews = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Không tìm thấy phim' });
        }

        const reviews = await Review.find({ movie: req.params.movieId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        const stats = reviews.reduce(
            (acc, r) => {
                acc.total += 1;
                acc.sum += r.rating;
                acc.distribution[r.rating] = (acc.distribution[r.rating] || 0) + 1;
                return acc;
            },
            { total: 0, sum: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
        );

        res.json({
            reviews,
            stats: {
                total: stats.total,
                average: stats.total > 0 ? Math.round((stats.sum / stats.total) * 10) / 10 : 0,
                distribution: stats.distribution,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        const userId = req.user._id;

        if (!movieId || !rating || !comment?.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ đánh giá và phản hồi' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 5 sao' });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Không tìm thấy phim' });
        }

        const existing = await Review.findOne({ movie: movieId, user: userId });
        if (existing) {
            return res.status(400).json({ message: 'Bạn đã đánh giá phim này rồi' });
        }

        const review = await Review.create({
            movie: movieId,
            user: userId,
            rating,
            comment: comment.trim(),
        });

        const populated = await Review.findById(review._id).populate('user', 'name');
        res.status(201).json(populated);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Bạn đã đánh giá phim này rồi' });
        }
        res.status(500).json({ message: error.message });
    }
};
