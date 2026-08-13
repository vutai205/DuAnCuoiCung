const Room = require('../models/Room');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

// @desc    Get all rooms with showtimes & active bookings count
// @route   GET /api/rooms
// @access  Public/Admin
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({}).lean();

        // Attach showtimes and active bookings stats to each room
        const roomsWithStats = await Promise.all(rooms.map(async (room) => {
            const showtimes = await Showtime.find({ room: room._id });
            const showtimeIds = showtimes.map(s => s._id);

            const activeBookingsCount = showtimeIds.length > 0
                ? await Booking.countDocuments({
                    showtime: { $in: showtimeIds },
                    status: { $ne: 'cancelled' }
                })
                : 0;

            return {
                ...room,
                showtimesCount: showtimes.length,
                bookingsCount: activeBookingsCount,
                hasActiveData: showtimes.length > 0 || activeBookingsCount > 0
            };
        }));

        res.json(roomsWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public/Admin
exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (room) {
            res.json(room);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: Tạo sơ đồ ghế theo loại phòng chiếu (Preset Template)
const generateLayoutByType = (type = '2D Standard', actualRows = 8, actualCols = 10, reqTotalSeats = null) => {
    const rowsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    const totalSeats = reqTotalSeats || (actualRows * actualCols);
    const seatLayout = [];
    let currentCount = 0;

    const cleanType = (type || '').toLowerCase();

    for (let i = 0; i < actualRows; i++) {
        let seatType = 'regular';

        if (cleanType.includes('sweetbox') || cleanType.includes('đôi') || cleanType.includes('couple')) {
            // Phòng Đôi Sweetbox: 100% ghế đôi
            seatType = 'couple';
        } else if (cleanType.includes('vip')) {
            // Phòng VIP: Toàn bộ hàng ghế là VIP, hàng cuối là ghế đôi cao cấp
            if (i === actualRows - 1 && actualRows > 2) {
                seatType = 'couple';
            } else {
                seatType = 'vip';
            }
        } else if (cleanType.includes('imax')) {
            // Phòng IMAX 3D: 2 hàng đầu Regular, khu giữa góc nhìn đỉnh là VIP, hàng cuối là Couple
            if (i < 2) {
                seatType = 'regular';
            } else if (i === actualRows - 1 && actualRows > 3) {
                seatType = 'couple';
            } else {
                seatType = 'vip';
            }
        } else if (cleanType.includes('4dx')) {
            // Phòng 4DX: 1 hàng đầu Regular, các hàng giữa 4DX Motion VIP, hàng cuối Couple
            if (i < 1) {
                seatType = 'regular';
            } else if (i === actualRows - 1 && actualRows > 3) {
                seatType = 'couple';
            } else {
                seatType = 'vip';
            }
        } else {
            // 2D Standard tiêu chuẩn: Hàng A-B (Regular), Hàng C-G (VIP), Hàng H (Couple)
            if (i >= 2 && i < actualRows - 1) seatType = 'vip';
            if (i === actualRows - 1 && actualRows > 3) seatType = 'couple';
        }

        for (let j = 1; j <= actualCols; j++) {
            if (currentCount < totalSeats) {
                seatLayout.push({
                    seatName: `${rowsLetters[i]}${j}`,
                    type: seatType,
                    status: 'active'
                });
                currentCount++;
            }
        }
    }

    return seatLayout;
};

// @desc    Create a room (Auto-generate seats)
// @route   POST /api/rooms
// @access  Private/Admin
exports.createRoom = async (req, res) => {
    try {
        const { name, type = '2D Standard', rowsCount = 8, seatsPerRow = 10, totalSeats: reqSeats, status = 'active' } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Tên phòng chiếu không được để trống!' });
        }

        const existingRoom = await Room.findOne({ name: name.trim() });
        if (existingRoom) {
            return res.status(400).json({ message: `Tên phòng chiếu "${name.trim()}" đã tồn tại! Vui lòng nhập tên khác.` });
        }

        const rowsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
        const actualRows = Math.min(rowsCount || 8, rowsLetters.length);
        const actualCols = seatsPerRow || 10;
        const totalSeats = reqSeats || (actualRows * actualCols);

        // Sinh sơ đồ ghế mẫu mặc định theo loại phòng
        const seatLayout = generateLayoutByType(type, actualRows, actualCols, totalSeats);

        const room = new Room({
            name: name.trim(),
            type,
            rowsCount: actualRows,
            seatsPerRow: actualCols,
            totalSeats,
            status,
            seatLayout
        });

        const createdRoom = await room.save();
        res.status(201).json(createdRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a room (including seatLayout and seat maintenance)
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Không tìm thấy phòng chiếu!' });
        }

        if (req.body.name && req.body.name.trim() !== room.name) {
            const existingRoom = await Room.findOne({ name: req.body.name.trim() });
            if (existingRoom) {
                return res.status(400).json({ message: `Tên phòng chiếu "${req.body.name.trim()}" đã tồn tại!` });
            }
            room.name = req.body.name.trim();
        }

        if (req.body.status) {
            room.status = req.body.status;
        }

        // Kiểm tra nếu muốn thay đổi kích thước/sơ đồ ghế khi phòng đang có vé đã đặt cho suất chiếu tương lai
        if (
            (req.body.rowsCount && req.body.rowsCount !== room.rowsCount) ||
            (req.body.seatsPerRow && req.body.seatsPerRow !== room.seatsPerRow) ||
            (Array.isArray(req.body.seatLayout) && req.body.seatLayout.length !== room.seatLayout?.length)
        ) {
            const futureShowtimes = await Showtime.find({
                room: room._id,
                startTime: { $gte: new Date() }
            });

            if (futureShowtimes.length > 0) {
                const showtimeIds = futureShowtimes.map(s => s._id);
                const activeBookings = await Booking.countDocuments({
                    showtime: { $in: showtimeIds },
                    status: { $ne: 'cancelled' }
                });

                if (activeBookings > 0) {
                    return res.status(400).json({
                        message: `⚠️ Không thể sửa kích thước/sơ đồ phòng chiếu này vì đang có ${activeBookings} đơn vé hợp lệ của các suất chiếu sắp tới!`
                    });
                }
            }
        }

        if (req.body.type) room.type = req.body.type;

        // Direct seat layout update (from visual seat layout editor)
        if (Array.isArray(req.body.seatLayout)) {
            room.seatLayout = req.body.seatLayout;
            room.totalSeats = req.body.seatLayout.length;
        } else if (
            (req.body.rowsCount && req.body.rowsCount !== room.rowsCount) ||
            (req.body.seatsPerRow && req.body.seatsPerRow !== room.seatsPerRow) ||
            (req.body.totalSeats && req.body.totalSeats !== room.totalSeats)
        ) {
            // Regenerate layout if dimensions changed using room type template
            const rowsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
            const newRows = req.body.rowsCount || room.rowsCount || 8;
            const newCols = req.body.seatsPerRow || room.seatsPerRow || 10;
            const actualRows = Math.min(newRows, rowsLetters.length);
            const totalSeats = req.body.totalSeats || (actualRows * newCols);

            room.rowsCount = actualRows;
            room.seatsPerRow = newCols;
            room.totalSeats = totalSeats;
            room.seatLayout = generateLayoutByType(room.type, actualRows, newCols, totalSeats);
        }

        const updatedRoom = await room.save();
        res.json(updatedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a room (Validate no active showtimes or bookings exist)
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ message: 'Không tìm thấy phòng chiếu!' });
        }

        // 1. Kiểm tra xem phòng chiếu có gắn với bất kỳ suất chiếu nào không
        const showtimes = await Showtime.find({ room: roomId });
        if (showtimes && showtimes.length > 0) {
            const showtimeIds = showtimes.map(s => s._id);
            const bookings = await Booking.find({
                showtime: { $in: showtimeIds },
                status: { $ne: 'cancelled' }
            });

            if (bookings.length > 0) {
                return res.status(400).json({
                    message: `🚫 KHÔNG THỂ XÓA: Phòng chiếu "${room.name}" đang có ${showtimes.length} suất chiếu và ${bookings.length} đơn đặt vé hợp lệ của khách hàng!`
                });
            }

            return res.status(400).json({
                message: `🚫 KHÔNG THỂ XÓA: Phòng chiếu "${room.name}" đang có ${showtimes.length} suất chiếu được lên lịch trong hệ thống. Vui lòng xóa các suất chiếu trước!`
            });
        }

        await room.deleteOne();
        res.json({ message: `Đã xóa phòng chiếu "${room.name}" thành công!` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
