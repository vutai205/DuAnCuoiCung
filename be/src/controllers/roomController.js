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

// @desc    Create a room (Auto-generate seats)
// @route   POST /api/rooms
// @access  Private/Admin
exports.createRoom = async (req, res) => {
    try {
        const { name, totalSeats } = req.body;

        // Tự động sinh mảng ghế: Hàng A, B, C... mỗi hàng 10 ghế
        const seatLayout = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
        let seatsPerRow = 10;
        let totalRows = Math.ceil(totalSeats / seatsPerRow);
        
        let currentSeatCount = 0;
        for (let i = 0; i < totalRows; i++) {
            for (let j = 1; j <= seatsPerRow; j++) {
                if (currentSeatCount < totalSeats) {
                    seatLayout.push(`${rows[i]}${j}`);
                    currentSeatCount++;
                }
            }
        }

        const room = new Room({
            name,
            totalSeats,
            seatLayout
        });

        const createdRoom = await room.save();
        res.status(201).json(createdRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            room.name = req.body.name || room.name;
            
            // Nếu thay đổi tổng số ghế, hệ thống nên sinh lại sơ đồ ghế
            if (req.body.totalSeats && req.body.totalSeats !== room.totalSeats) {
                room.totalSeats = req.body.totalSeats;
                
                const seatLayout = [];
                const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
                let seatsPerRow = 10;
                let totalRows = Math.ceil(room.totalSeats / seatsPerRow);
                
                let currentSeatCount = 0;
                for (let i = 0; i < totalRows; i++) {
                    for (let j = 1; j <= seatsPerRow; j++) {
                        if (currentSeatCount < room.totalSeats) {
                            seatLayout.push(`${rows[i]}${j}`);
                            currentSeatCount++;
                        }
                    }
                }
                room.seatLayout = seatLayout;
            }

            const updatedRoom = await room.save();
            res.json(updatedRoom);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
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
