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

// @desc    Get all showtimes (Admin view)
// @route   GET /api/showtimes
// @access  Public/Admin
exports.getShowtimes = async (req, res) => {
    try {
        const showtimes = await Showtime.find({}).populate('movie room');
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a showtime
// @route   POST /api/showtimes
// @access  Private/Admin
exports.createShowtime = async (req, res) => {
    try {
        const { movie, room, startTime, endTime, ticketPrice } = req.body;
        
        const showtime = new Showtime({
            movie,
            room,
            startTime,
            endTime,
            ticketPrice
        });

        const createdShowtime = await showtime.save();
        res.status(201).json(createdShowtime);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a showtime
// @route   PUT /api/showtimes/:id
// @access  Private/Admin
exports.updateShowtime = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);

        if (showtime) {
            Object.assign(showtime, req.body);
            const updatedShowtime = await showtime.save();
            res.json(updatedShowtime);
        } else {
            res.status(404).json({ message: 'Showtime not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a showtime
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
exports.deleteShowtime = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);

        if (showtime) {
            await showtime.deleteOne();
            res.json({ message: 'Showtime removed' });
        } else {
            res.status(404).json({ message: 'Showtime not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
