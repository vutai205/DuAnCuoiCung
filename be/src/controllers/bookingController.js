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
