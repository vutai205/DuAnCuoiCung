const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
    try {
        const { showtimeId, seats } = req.body;
        // In a real app, userId comes from req.user (JWT middleware)
        const userId = req.user ? req.user._id : req.body.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!seats || seats.length === 0) {
            return res.status(400).json({ message: 'No seats selected' });
        }

        const showtime = await Showtime.findById(showtimeId).populate('room');
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        // Validate if seats exist in the room layout
        const validSeats = seats.every(seat => showtime.room.seatLayout.some(s => s.seatName === seat));
        if (!validSeats) {
            return res.status(400).json({ message: 'Một hoặc nhiều ghế không hợp lệ trong phòng chiếu này' });
        }

        // Prevent Double Booking
        const existingBookings = await Booking.find({
            showtime: showtimeId,
            status: { $ne: 'cancelled' }
        });

        let allBookedSeats = [];
        existingBookings.forEach(b => {
            allBookedSeats = allBookedSeats.concat(b.seats);
        });

        const isSeatTaken = seats.some(seat => allBookedSeats.includes(seat));
        if (isSeatTaken) {
            return res.status(400).json({ message: 'Một hoặc nhiều ghế bạn chọn đã được người khác đặt. Vui lòng chọn ghế khác!' });
        }

        // Calculate total price based on seat types
        let totalPrice = 0;
        seats.forEach(seatName => {
            const seatInfo = showtime.room.seatLayout.find(s => s.seatName === seatName);
            if (seatInfo) {
                let seatPrice = showtime.ticketPrice;
                if (seatInfo.type === 'vip') seatPrice += 10000; // Phụ thu ghế VIP
                if (seatInfo.type === 'couple') seatPrice += 20000; // Phụ thu ghế Couple
                totalPrice += seatPrice;
            }
        });

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
