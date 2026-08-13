const Showtime = require('../models/Showtime');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { expirePendingBookings } = require('./bookingController');
const moment = require('moment');

/**
 * Checks if a proposed showtime overlaps with existing showtimes in the specified room
 */
const checkShowtimeOverlap = async (roomId, startTime, endTime, excludeShowtimeId = null) => {
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    const query = {
        room: roomId,
        startTime: { $lt: newEnd },
        endTime: { $gt: newStart }
    };

    if (excludeShowtimeId) {
        query._id = { $ne: excludeShowtimeId };
    }

    return await Showtime.findOne(query).populate('movie room');
};

// @desc    Get showtimes for a movie (Grouped by Date)
// @route   GET /api/showtimes/movie/:movieId
exports.getShowtimesByMovie = async (req, res) => {
    try {
        // 1. Chỉ lấy các suất chiếu chưa diễn ra (>= thời điểm hiện tại)
        const showtimes = await Showtime.find({ 
            movie: req.params.movieId,
            startTime: { $gte: new Date() }
        })
        .populate('room', 'name type status') // Lấy tên, loại & trạng thái phòng
        .sort({ startTime: 1 }); // Sắp xếp giờ chiếu tăng dần

        // Lọc bỏ các suất chiếu mồ côi hoặc thuộc phòng chiếu ĐANG BẢO TRÌ
        const validShowtimes = showtimes.filter(st => st.room != null && st.room.status !== 'maintenance');

        // 2. Nhóm các suất chiếu theo Ngày (YYYY-MM-DD) theo Múi giờ Việt Nam (UTC+7)
        const grouped = validShowtimes.reduce((acc, showtime) => {
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
        if (!showtime || !showtime.room) {
            return res.status(404).json({ message: 'Phòng chiếu của suất chiếu này không tồn tại hoặc đã bị xóa!' });
        }

        const seatLayout = showtime.room.seatLayout || []; // Mảng tất cả các ghế trong phòng

        // 2. Lấy tất cả các ghế đã được đặt trong suất chiếu này (Loại trừ các đơn hết hạn 5p)
        const now = new Date();
        const bookings = await Booking.find({ 
            showtime: showtimeId, 
            status: { $ne: 'cancelled' },
            $or: [
                { paymentMethod: 'cash' },
                { expiresAt: { $gt: now } }
            ]
        });
        
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
            vipSurcharge: showtime.vipSurcharge || 15000,
            coupleSurcharge: showtime.coupleSurcharge || 20000,
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
        
        const showtimeIds = showtimes.map(st => st._id).filter(id => id != null);

        let bookingMap = {};
        if (showtimeIds.length > 0) {
            try {
                const activeBookings = await Booking.aggregate([
                    { $match: { showtime: { $in: showtimeIds }, status: { $ne: 'cancelled' } } },
                    { 
                        $group: { 
                            _id: '$showtime', 
                            totalSeats: { 
                                $sum: { 
                                    $cond: { 
                                        if: { $isArray: '$seats' }, 
                                        then: { $size: '$seats' }, 
                                        else: 0 
                                    } 
                                } 
                            } 
                        } 
                    }
                ]);

                activeBookings.forEach(b => {
                    if (b && b._id) {
                        bookingMap[b._id.toString()] = b.totalSeats || 0;
                    }
                });
            } catch (aggErr) {
                console.error('Lỗi tính số ghế đã đặt:', aggErr);
            }
        }

        const showtimesWithBookings = showtimes.map(st => ({
            ...st,
            bookedSeatsCount: (st && st._id && bookingMap[st._id.toString()]) ? bookingMap[st._id.toString()] : 0
        }));

        res.json(showtimesWithBookings);
    } catch (error) {
        console.error('Lỗi getShowtimes:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi lấy danh sách suất chiếu' });
    }
};

const Movie = require('../models/Movie');

// Helper: Kiểm tra tương thích giữa định dạng phim và loại phòng chiếu
const checkRoomMovieCompatibility = (room, movie) => {
    if (room.status === 'maintenance') {
        return `⚠️ Phòng chiếu "${room.name}" đang trong trạng thái BẢO TRÌ! Không thể xếp suất chiếu.`;
    }

    if (movie.status === 'ended') {
        return `⚠️ Phim "${movie.title}" ĐÃ NGỪNG CHIẾU! Không thể tạo thêm suất chiếu mới.`;
    }

    const movieFormat = (movie.format || '2D').toUpperCase();
    const roomType = (room.type || room.name || '').toUpperCase();

    if (movieFormat.includes('IMAX')) {
        if (!roomType.includes('IMAX')) {
            return `⚠️ Phim định dạng "${movie.format}" chỉ được chiếu ở Phòng chiếu IMAX! (Phòng "${room.name}" là loại ${room.type})`;
        }
    } else if (movieFormat.includes('4DX')) {
        if (!roomType.includes('4DX')) {
            return `⚠️ Phim định dạng "${movie.format}" chỉ được chiếu ở Phòng chiếu 4DX! (Phòng "${room.name}" là loại ${room.type})`;
        }
    } else if (movieFormat.includes('3D')) {
        if (!roomType.includes('IMAX') && !roomType.includes('4DX') && !roomType.includes('VIP') && !roomType.includes('3D')) {
            return `⚠️ Phim 3D yêu cầu phòng chiếu có hỗ trợ 3D/IMAX/VIP!`;
        }
    }

    return null;
};

// @desc    Create a showtime
// @route   POST /api/showtimes
// @access  Private/Admin
exports.createShowtime = async (req, res) => {
    try {
        const { movie: movieId, room: roomId, startTime, endTime, ticketPrice, vipSurcharge = 15000, coupleSurcharge = 20000, status = 'upcoming' } = req.body;
        
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        if (newStart < new Date()) {
            return res.status(400).json({ message: 'Không thể tạo suất chiếu ở thời gian trong quá khứ!' });
        }

        if (newEnd <= newStart) {
            return res.status(400).json({ message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu!' });
        }

        // 🛑 Kiểm tra tương thích Loại Phòng & Định Dạng Phim
        const roomDoc = await Room.findById(roomId);
        const movieDoc = await Movie.findById(movieId);

        if (!roomDoc) {
            return res.status(404).json({ message: 'Không tìm thấy phòng chiếu!' });
        }
        if (!movieDoc) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin phim!' });
        }

        const compatError = checkRoomMovieCompatibility(roomDoc, movieDoc);
        if (compatError) {
            return res.status(400).json({ message: compatError });
        }

        // 🛑 Kiểm tra trùng lịch suất chiếu cùng phòng
        const conflict = await checkShowtimeOverlap(roomId, newStart, newEnd);
        if (conflict) {
            const conflictMovieTitle = conflict.movie?.title || 'Phim khác';
            const conflictRoomName = conflict.room?.name || 'Phòng chiếu';
            const conflictStart = moment(conflict.startTime).format('HH:mm DD/MM/YYYY');
            const conflictEnd = moment(conflict.endTime).format('HH:mm DD/MM/YYYY');
            return res.status(400).json({
                message: `Trùng lịch chiếu! Phòng "${conflictRoomName}" đã có suất chiếu phim "${conflictMovieTitle}" từ ${conflictStart} đến ${conflictEnd}.`
            });
        }

        const showtime = new Showtime({
            movie: movieId,
            room: roomId,
            startTime,
            endTime,
            ticketPrice,
            vipSurcharge,
            coupleSurcharge,
            status
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

        // 🛑 Kiểm tra loại bỏ từng suất chiếu bị trùng lịch DB, Phòng chiếu đang Bảo trì hoặc Phim đã Ngừng chiếu
        const nonConflictingShowtimes = [];
        for (const st of validShowtimes) {
            const movieDoc = await Movie.findById(st.movie);
            if (!movieDoc || movieDoc.status === 'ended') {
                continue; // Chặn phim đã ngừng chiếu
            }

            const roomDoc = await Room.findById(st.room);
            if (!roomDoc || roomDoc.status === 'maintenance') {
                continue; // Chặn phòng chiếu đang bảo trì
            }
            const conflict = await checkShowtimeOverlap(st.room, st.startTime, st.endTime);
            if (!conflict) {
                nonConflictingShowtimes.push(st);
            }
        }

        if (nonConflictingShowtimes.length === 0) {
            return res.status(400).json({ message: 'Tất cả các suất chiếu gửi lên đều bị trùng lịch, thuộc phòng BẢO TRÌ hoặc thuộc phim ĐÃ NGỪNG CHIẾU!' });
        }

        const createdShowtimes = await Showtime.insertMany(nonConflictingShowtimes);
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

        const targetRoom = req.body.room || showtime.room;
        const targetStart = req.body.startTime || showtime.startTime;
        const targetEnd = req.body.endTime || showtime.endTime;

        // 🛑 Kiểm tra trùng lịch suất chiếu cùng phòng khi cập nhật
        const conflict = await checkShowtimeOverlap(targetRoom, targetStart, targetEnd, showtime._id);
        if (conflict) {
            const conflictMovieTitle = conflict.movie?.title || 'Phim khác';
            const conflictRoomName = conflict.room?.name || 'Phòng chiếu';
            const conflictStart = moment(conflict.startTime).format('HH:mm DD/MM/YYYY');
            const conflictEnd = moment(conflict.endTime).format('HH:mm DD/MM/YYYY');
            return res.status(400).json({
                message: `Trùng lịch chiếu! Phòng "${conflictRoomName}" đã có suất chiếu phim "${conflictMovieTitle}" từ ${conflictStart} đến ${conflictEnd}.`
            });
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
