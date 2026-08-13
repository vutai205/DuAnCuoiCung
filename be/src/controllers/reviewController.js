const Review = require('../models/Review');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

// @desc    Get reviews for a movie & check user eligible status
// @route   GET /api/reviews/movie/:movieId
exports.getMovieReviews = async (req, res) => {
    try {
        const { movieId } = req.params;
        const reviews = await Review.find({ movie: movieId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
            : 0;

        let hasPurchased = false;
        let hasReviewed = false;

        if (req.user) {
            const movieShowtimeIds = await Showtime.find({ movie: movieId }).distinct('_id');
            const booking = await Booking.findOne({
                user: req.user._id,
                showtime: { $in: movieShowtimeIds },
                paymentStatus: 'paid'
            });
            hasPurchased = !!booking;

            const existing = await Review.findOne({ user: req.user._id, movie: movieId });
            hasReviewed = !!existing;
        }

        res.json({
            reviews,
            totalReviews,
            averageRating: Number(averageRating),
            hasPurchased,
            hasReviewed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add review for a movie (Only allowed if user bought ticket)
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;

        if (!movieId) {
            return res.status(400).json({ message: 'Vui lòng chọn phim cần đánh giá!' });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Vui lòng chọn số sao từ 1 đến 5!' });
        }
        if (!comment || !comment.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập lời nhận xét đánh giá!' });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Phim không tồn tại!' });
        }

        // 1. Check if user already reviewed this movie
        const existingReview = await Review.findOne({ user: req.user._id, movie: movieId });
        if (existingReview) {
            return res.status(400).json({ message: '⚠️ Bạn đã viết đánh giá cho bộ phim này rồi!' });
        }

        // 2. Check if user has actually bought ticket for this movie
        const movieShowtimeIds = await Showtime.find({ movie: movieId }).distinct('_id');
        const validBooking = await Booking.findOne({
            user: req.user._id,
            showtime: { $in: movieShowtimeIds },
            $or: [
                { paymentStatus: 'paid' },
                { status: 'confirmed' }
            ]
        });

        if (!validBooking) {
            return res.status(403).json({
                message: '🎟️ Bạn cần phải mua vé xem phim này thành công trước khi gửi đánh giá!'
            });
        }

        const review = await Review.create({
            user: req.user._id,
            movie: movieId,
            rating: Number(rating),
            comment: comment.trim(),
            userName: req.user.name,
            userAvatar: req.user.avatar
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
