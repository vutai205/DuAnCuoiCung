const Showtime = require('../models/Showtime');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { expirePendingBookings } = require('./bookingController');

// @desc    Get showtimes for a movie (Grouped by Date)
// @route   GET /api/showtimes/movie/:movieId
exports.getShowtimesByMovie = async (req, res) => {
    try {
        // 1. Chỉ lấy các suất chiếu chưa diễn ra (>= thời điểm hiện tại)
        const showtimes = await Showtime.find({ 
            movie: req.params.movieId,
            startTime: { $gte: new Date() }
        })
        .populate('room', 'name') // Chỉ cần lấy tên phòng
        .sort({ startTime: 1 }); // Sắp xếp giờ chiếu tăng dần

        // 2. Nhóm các suất chiếu theo Ngày (YYYY-MM-DD) theo Múi giờ Việt Nam (UTC+7)
        const grouped = showtimes.reduce((acc, showtime) => {
            const d = new Date(showtime.startTime);
            // Cộng 7 giờ để chuyển đổi UTC sang Giờ Việt Nam (GMT+7)
            const vnDate = new Date(d.getTime() + (7 * 60 * 60 * 1000));
            const dateStr = vnDate.toISOString().split('T')[0];
            
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(showtime);
            return acc;
        }, {});

        // 3. Chuyển đổi Object thành Mảng để React dễ dùng hàm .map()
        const result = Object.keys(grouped).map(date => ({
            date: date,
            showtimes: grouped[date]
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available seats for a showtime
// @route   GET /api/showtimes/:id/seats
exports.getShowtimeSeats = async (req, res) => {
    try {
        const showtimeId = req.params.id;
        
        // Auto-expire pending seat holds older than 5 minutes for this showtime
        await expirePendingBookings(showtimeId);

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
        const seatStatuses = seatLayout.map(seatObj => {
            const isMaintenance = seatObj.type === 'maintenance' || seatObj.status === 'maintenance';
            return {
                seatName: seatObj.seatName,
                type: seatObj.type,
                status: isMaintenance ? 'maintenance' : 'active',
                isBooked: bookedSeats.includes(seatObj.seatName)
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
        const showtimes = await Showtime.find({}).populate('movie room').sort({ startTime: 1 }).lean();
        
        const showtimeIds = showtimes.map(st => st._id);
        const activeBookings = await Booking.aggregate([
            { $match: { showtime: { $in: showtimeIds }, status: { $ne: 'cancelled' } } },
            { $group: { _id: '$showtime', totalSeats: { $sum: { $size: '$seats' } } } }
        ]);

        const bookingMap = {};
        activeBookings.forEach(b => {
            bookingMap[b._id.toString()] = b.totalSeats;
        });

        const showtimesWithBookings = showtimes.map(st => ({
            ...st,
            bookedSeatsCount: bookingMap[st._id.toString()] || 0
        }));

        res.json(showtimesWithBookings);
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
        
        if (new Date(startTime) < new Date()) {
            return res.status(400).json({ message: 'Không thể tạo suất chiếu ở thời gian trong quá khứ!' });
        }

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

// @desc    Create batch showtimes (Admin)
// @route   POST /api/showtimes/batch
// @access  Private/Admin
exports.createBatchShowtimes = async (req, res) => {
    try {
        const { showtimes } = req.body;
        if (!Array.isArray(showtimes) || showtimes.length === 0) {
            return res.status(400).json({ message: 'Danh sách suất chiếu không hợp lệ!' });
        }

        const now = new Date();
        const validShowtimes = showtimes.filter(st => new Date(st.startTime) >= now);

        if (validShowtimes.length === 0) {
            return res.status(400).json({ message: 'Tất cả các suất chiếu được chọn đều trong quá khứ, không thể lưu!' });
        }

        const createdShowtimes = await Showtime.insertMany(validShowtimes);
        res.status(201).json({
            success: true,
            count: createdShowtimes.length,
            message: `Tạo thành công ${createdShowtimes.length} suất chiếu!`
        });
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

        if (!showtime) {
            return res.status(404).json({ message: 'Không tìm thấy suất chiếu!' });
        }

        const now = new Date();
        const start = new Date(showtime.startTime);
        const end = showtime.endTime ? new Date(showtime.endTime) : start;

        if (end < now) {
            return res.status(400).json({ message: 'Suất chiếu đã kết thúc, không thể chỉnh sửa!' });
        }

        if (start <= now && end >= now) {
            return res.status(400).json({ message: 'Suất chiếu đang diễn ra, không thể chỉnh sửa!' });
        }

        const activeBookingsCount = await Booking.countDocuments({
            showtime: showtime._id,
            status: { $ne: 'cancelled' }
        });

        if (activeBookingsCount > 0) {
            return res.status(400).json({ message: `Suất chiếu đã có khách đặt vé (${activeBookingsCount} đơn vé), không thể chỉnh sửa!` });
        }

        Object.assign(showtime, req.body);
        const updatedShowtime = await showtime.save();
        res.json(updatedShowtime);
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

        if (!showtime) {
            return res.status(404).json({ message: 'Không tìm thấy suất chiếu!' });
        }

        const now = new Date();
        const start = new Date(showtime.startTime);
        const end = showtime.endTime ? new Date(showtime.endTime) : start;

        if (start <= now && end >= now) {
            return res.status(400).json({ message: 'Suất chiếu đang diễn ra, không thể xóa!' });
        }

        const activeBookingsCount = await Booking.countDocuments({
            showtime: showtime._id,
            status: { $ne: 'cancelled' }
        });

        if (activeBookingsCount > 0) {
            return res.status(400).json({ message: `Suất chiếu đã có khách đặt vé (${activeBookingsCount} đơn vé), không thể xóa!` });
        }

        await showtime.deleteOne();
        res.json({ message: 'Đã xóa suất chiếu thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
