const Showtime = require('../models/Showtime');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get showtimes for a movie
// @route   GET /api/showtimes/movie/:movieId
exports.getShowtimesByMovie = async (req, res) => {
    try {
        const showtimes = await Showtime.find({ movie: req.params.movieId }).populate('room');
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available seats for a showtime
// @route   GET /api/showtimes/:id/seats
exports.getShowtimeSeats = async (req, res) => {
    try {
        const showtimeId = req.params.id;
        
        // 1. Lấy thông tin showtime & room
        const showtime = await Showtime.findById(showtimeId).populate('room');
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        const seatLayout = showtime.room.seatLayout; // Mảng tất cả các ghế trong phòng

        // 2. Lấy tất cả các ghế đã được đặt trong suất chiếu này
        const bookings = await Booking.find({ showtime: showtimeId, status: { $ne: 'cancelled' } });
        
        let bookedSeats = [];
        bookings.forEach(booking => {
            bookedSeats = bookedSeats.concat(booking.seats);
        });

        // 3. Tính toán trạng thái của từng ghế
        const seatStatuses = seatLayout.map(seat => {
            return {
                seatName: seat,
                isBooked: bookedSeats.includes(seat)
            };
        });

        res.json({
            showtimeId,
            room: showtime.room.name,
            ticketPrice: showtime.ticketPrice,
            seats: seatStatuses
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
