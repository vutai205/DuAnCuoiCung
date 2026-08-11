const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public/Admin
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({});
        res.json(rooms);
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
        const { name, type = '2D Standard', rowsCount = 8, seatsPerRow = 10, totalSeats: reqSeats } = req.body;

        const rowsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
        const actualRows = Math.min(rowsCount || 8, rowsLetters.length);
        const actualCols = seatsPerRow || 10;
        const totalSeats = reqSeats || (actualRows * actualCols);

        // Sinh sơ đồ ghế mẫu mặc định theo loại phòng
        const seatLayout = generateLayoutByType(type, actualRows, actualCols, totalSeats);

        const room = new Room({
            name,
            type,
            rowsCount: actualRows,
            seatsPerRow: actualCols,
            totalSeats,
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
            return res.status(404).json({ message: 'Room not found' });
        }

        room.name = req.body.name || room.name;
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

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            await room.deleteOne();
            res.json({ message: 'Room removed' });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
