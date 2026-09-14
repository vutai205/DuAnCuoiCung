const Review = require('../models/Review');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

// @desc    Get reviews for a movie (Only visible/non-hidden reviews) & check user eligible status
// @route   GET /api/reviews/movie/:movieId
exports.getMovieReviews = async (req, res) => {
    try {
        const { movieId } = req.params;
        const reviews = await Review.find({ movie: movieId, isHidden: { $ne: true } })
            .populate('user', 'name avatar email')
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

// @desc    Get all reviews for Admin management (includes hidden ones)
// @route   GET /api/reviews
// @access  Admin
exports.getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('movie', 'title poster genre rating')
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Hide/Unhide a review (Soft hide instead of delete)
// @route   PUT /api/reviews/:id/toggle-hide
// @access  Admin
exports.toggleHideReviewAdmin = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá!' });
        }

        review.isHidden = !review.isHidden;
        await review.save();

        res.json({
            success: true,
            message: review.isHidden ? 'Đã ẩn đánh giá thành công!' : 'Đã hiển thị lại đánh giá!',
            data: review
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin reply to a review
// @route   PUT /api/reviews/:id/reply
// @access  Admin
exports.replyReviewAdmin = async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply || !reply.trim()) {
            return res.status(400).json({ message: 'Nội dung phản hồi không được để trống!' });
        }

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { 
                adminReply: reply.trim(),
                adminReplyAt: new Date()
            },
            { new: true }
        ).populate('movie', 'title poster').populate('user', 'name email');

        if (!review) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá!' });
        }

        res.json({ success: true, message: 'Đã phản hồi đánh giá thành công!', data: review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
