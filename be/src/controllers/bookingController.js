const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
    try {
        const { showtimeId, seats } = req.body;
        // In a real app, userId comes from req.user (JWT middleware)
        // We'll simulate it for now or require it in body if no middleware yet
        const userId = req.user ? req.user._id : req.body.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!seats || seats.length === 0) {
            return res.status(400).json({ message: 'No seats selected' });
        }

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        // Calculate total price
        const totalPrice = showtime.ticketPrice * seats.length;

        const booking = await Booking.create({
            user: userId,
            showtime: showtimeId,
            seats,
            totalPrice
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.query.userId;
        const bookings = await Booking.find({ user: userId }).populate({
            path: 'showtime',
            populate: { path: 'movie room' }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user', 'name email').populate({
            path: 'showtime',
            populate: { path: 'movie room' }
        }).sort({ createdAt: -1 }); // Mới nhất lên đầu
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            booking.status = status;
            const updatedBooking = await booking.save();
            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/bookings/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const Movie = require('../models/Movie');

        // Tổng doanh thu (chỉ tính những đơn đã confirmed)
        const bookings = await Booking.find({ status: 'confirmed' });
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        const totalUsers = await User.countDocuments({});
        const totalMovies = await Movie.countDocuments({});
        const totalBookings = await Booking.countDocuments({});

        res.json({
            totalRevenue,
            totalUsers,
            totalMovies,
            totalBookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
