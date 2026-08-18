const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Food = require('../models/Food');

// Helper: Trừ số lượng đồ ăn trong kho khi đơn hàng được thanh toán / xác nhận / check-in
const deductFoodStock = async (booking) => {
    try {
        if (!booking || !booking.combos || booking.combos.length === 0) return;
        if (booking.isFoodDeducted) return; // Tránh trừ trùng lặp nhiều lần

        for (const item of booking.combos) {
            const qtyNeeded = item.count || 0;
            if (qtyNeeded <= 0) continue;

            let food = null;
            // 1. Tìm theo foodId nếu có
            if (item.foodId && mongoose.Types.ObjectId.isValid(item.foodId)) {
                food = await Food.findById(item.foodId);
            }
            // 2. Dự phòng: Tìm theo tên chính xác
            if (!food && item.name) {
                food = await Food.findOne({ name: item.name });
            }
            // 3. Dự phòng: Tìm tương đối theo chuỗi tên
            if (!food && item.name) {
                const cleanName = item.name.split('(')[0].trim();
                food = await Food.findOne({ name: { $regex: cleanName, $options: 'i' } });
            }

            if (food) {
                food.quantity = Math.max(0, food.quantity - qtyNeeded);
                await food.save();
            }
        }

        booking.isFoodDeducted = true;
        await booking.save();
    } catch (err) {
        console.error('Lỗi khi trừ số lượng đồ ăn trong kho:', err);
    }
};

// Helper: Hoàn trả số lượng đồ ăn vào kho khi hủy đơn hàng / hủy checkin
const restoreFoodStock = async (booking) => {
    try {
        if (!booking || !booking.combos || booking.combos.length === 0) return;
        if (!booking.isFoodDeducted) return; // Chưa từng trừ kho thì không cần hoàn

        for (const item of booking.combos) {
            const qtyRestore = item.count || 0;
            if (qtyRestore <= 0) continue;

            let food = null;
            if (item.foodId && mongoose.Types.ObjectId.isValid(item.foodId)) {
                food = await Food.findById(item.foodId);
            }
            if (!food && item.name) {
                food = await Food.findOne({ name: item.name });
            }
            if (!food && item.name) {
                const cleanName = item.name.split('(')[0].trim();
                food = await Food.findOne({ name: { $regex: cleanName, $options: 'i' } });
            }

            if (food) {
                food.quantity += qtyRestore;
                await food.save();
            }
        }

        booking.isFoodDeducted = false;
        await booking.save();
    } catch (err) {
        console.error('Lỗi khi hoàn trả đồ ăn vào kho:', err);
    }
};

const expirePendingBookings = async (showtimeId) => {
    const now = new Date();
    const holdTimeoutMs = 5 * 60 * 1000; // 5 minutes

    const query = {
        status: 'pending',
        paymentMethod: { $ne: 'cash' },
        $or: [
            { expiresAt: { $ne: null, $lt: now } },
            { createdAt: { $lt: new Date(now.getTime() - holdTimeoutMs) } }
        ]
    };

    if (showtimeId) query.showtime = showtimeId;

    await Booking.updateMany(query, {
        status: 'cancelled',
        paymentStatus: 'failed'
    });
};

exports.expirePendingBookings = expirePendingBookings;
exports.deductFoodStock = deductFoodStock;
exports.restoreFoodStock = restoreFoodStock;

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
    try {
        const { showtimeId, seats, combos, totalPrice: reqPrice, paymentMethod = 'vnpay', voucherCode, discountAmount = 0 } = req.body;
        
        // Auto-expire pending VNPay seat holds older than 5 minutes for this showtime
        await expirePendingBookings(showtimeId);
        
        const userId = req.user ? req.user._id : req.body.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Chặn tài khoản Admin thực hiện đặt vé mua hàng
        if (req.user && req.user.role === 'admin') {
            return res.status(403).json({ 
                message: '🚫 Tài khoản Quản trị viên (Admin) không được phép thực hiện mua vé! Vui lòng sử dụng tài khoản Khách hàng.' 
            });
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

        // Check active pending booking
        const now = new Date();

        // Prevent Double Booking from OTHER users
        const existingBookings = await Booking.find({
            showtime: showtimeId,
            status: { $ne: 'cancelled' },
            $or: [
                { paymentMethod: 'cash' },
                { expiresAt: { $gt: now } }
            ]
        });

        // Filter out bookings by OTHER users vs SAME user
        const otherUserBookings = existingBookings.filter(
            b => b.user.toString() !== userId.toString()
        );

        let otherUserSeats = [];
        otherUserBookings.forEach(b => {
            otherUserSeats = otherUserSeats.concat(b.seats);
        });

        const isSeatTakenByOther = seats.some(seat => otherUserSeats.includes(seat));
        if (isSeatTakenByOther) {
            return res.status(400).json({ message: 'Một hoặc nhiều ghế bạn chọn đã được người khác giữ chỗ. Vui lòng chọn ghế khác!' });
        }

        // If the SAME user already has an active pending booking for this showtime, reuse/update it instead of throwing duplicate error!
        const existingSameUserPending = existingBookings.find(
            b => b.user.toString() === userId.toString() && b.status === 'pending'
        );

        const isCash = paymentMethod === 'cash';
        const expiresAt = isCash ? null : new Date(now.getTime() + 5 * 60 * 1000);
        const bookingStatus = isCash ? 'confirmed' : 'pending';

        let booking;
        if (existingSameUserPending) {
            existingSameUserPending.seats = seats;
            existingSameUserPending.combos = combos || [];
            existingSameUserPending.totalPrice = reqPrice;
            existingSameUserPending.voucherCode = voucherCode || null;
            existingSameUserPending.discountAmount = Number(discountAmount) || 0;
            existingSameUserPending.paymentMethod = paymentMethod;
            existingSameUserPending.expiresAt = expiresAt;
            existingSameUserPending.status = bookingStatus;

            booking = await existingSameUserPending.save();
        } else {
            const ticketCode = `TNA-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
            booking = await Booking.create({
                user: userId,
                showtime: showtimeId,
                seats,
                combos: combos || [],
                totalPrice: reqPrice,
                voucherCode: voucherCode || null,
                discountAmount: Number(discountAmount) || 0,
                ticketCode,
                paymentMethod,
                expiresAt,
                status: bookingStatus,
                paymentStatus: 'unpaid'
            });
        }

        // Increment voucher usage count if valid voucher code was provided
        if (voucherCode) {
            const Voucher = require('../models/Voucher');
            await Voucher.updateOne({ code: voucherCode.trim().toUpperCase() }, { $inc: { usedCount: 1 } });
        }

        // Send confirmation email asynchronously for confirmed cash bookings
        if (isCash) {
            const sendTicketEmail = require('../utils/sendTicketEmail');
            sendTicketEmail(booking._id).catch(err => console.error("[Email Error]", err));
        }

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get booking by ID or ticket code
// @route   GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const cleanId = id ? id.trim() : '';

        if (!cleanId) {
            return res.status(400).json({ message: 'Mã tra cứu không được để trống' });
        }

        let booking = null;

        // 1. If valid 24-character ObjectId hex string
        if (mongoose.Types.ObjectId.isValid(cleanId)) {
            booking = await Booking.findById(cleanId).populate('user', 'name email phone').populate({
                path: 'showtime',
                populate: { path: 'movie room' }
            });
        }

        // 2. Search by ticketCode (exact or case-insensitive regex pattern)
        if (!booking) {
            booking = await Booking.findOne({
                $or: [
                    { ticketCode: cleanId.toUpperCase() },
                    { ticketCode: { $regex: cleanId, $options: 'i' } }
                ]
            }).populate('user', 'name email phone').populate({
                path: 'showtime',
                populate: { path: 'movie room' }
            });
        }

        if (!booking) {
            return res.status(404).json({ message: `Không tìm thấy đơn đặt vé nào với mã: "${cleanId}"` });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.query.userId;
        
        // Auto expire old pending VNPay bookings
        const now = new Date();
        await Booking.updateMany({
            user: userId,
            status: 'pending',
            paymentMethod: { $ne: 'cash' },
            $or: [
                { expiresAt: { $ne: null, $lt: now } },
                { createdAt: { $lt: new Date(now.getTime() - 5 * 60 * 1000) } }
            ]
        }, {
            status: 'cancelled',
            paymentStatus: 'failed'
        });

        const bookings = await Booking.find({ user: userId }).populate({
            path: 'showtime',
            populate: { path: 'movie room' }
        }).sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
exports.getBookings = async (req, res) => {
    try {
        const now = new Date();
        await Booking.updateMany({
            status: 'pending',
            paymentMethod: { $ne: 'cash' },
            $or: [
                { expiresAt: { $ne: null, $lt: now } },
                { createdAt: { $lt: new Date(now.getTime() - 5 * 60 * 1000) } }
            ]
        }, {
            status: 'cancelled',
            paymentStatus: 'failed'
        });

        const bookings = await Booking.find({}).populate('user', 'name email phone').populate({
            path: 'showtime',
            populate: { path: 'movie room' }
        }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            booking.status = status;
            if (status === 'confirmed') booking.paymentStatus = 'paid';
            const updatedBooking = await booking.save();

            if (status === 'confirmed') {
                await deductFoodStock(updatedBooking);
            } else if (status === 'cancelled') {
                await restoreFoodStock(updatedBooking);
            }

            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Print ticket (allows only 1 print, records first print timestamp)
// @route   PUT /api/bookings/:id/print
exports.printBookingTicket = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('user', 'name email phone').populate({
            path: 'showtime',
            populate: { path: 'movie room' }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy vé xem phim này!' });
        }

        // Prevent printing if VNPay online payment has NOT been completed
        if (booking.paymentMethod === 'vnpay' && booking.paymentStatus !== 'paid') {
            return res.status(400).json({ message: '⚠️ Khách chưa hoàn tất thanh toán VNPay Online! Không thể in vé.' });
        }

        // If ticket was already printed previously
        if (booking.isPrinted) {
            return res.status(400).json({
                success: false,
                isPrinted: true,
                printedAt: booking.printedAt,
                booking,
                message: `⚠️ VÉ NÀY ĐÃ ĐƯỢC IN LẦN ĐẦU LÚC: ${new Date(booking.printedAt).toLocaleString('vi-VN')}. Không thể in lại!`
            });
        }

        // Perform first print & confirm payment for cash bookings
        booking.isPrinted = true;
        booking.printedAt = new Date();
        booking.isCheckedIn = true;
        booking.status = 'confirmed';
        if (booking.paymentMethod === 'cash') {
            booking.paymentStatus = 'paid';
        }

        const updatedBooking = await booking.save();

        // Trừ kho đồ ăn khi in vé & check-in
        await deductFoodStock(updatedBooking);

        res.json({
            success: true,
            isPrinted: true,
            printedAt: updatedBooking.printedAt,
            booking: updatedBooking,
            message: 'In vé thành công!'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check-in ticket at cinema
// @route   PUT /api/bookings/:id/checkin
exports.checkinBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy vé đặt!' });
        }

        // Prevent check-in if VNPay online payment has NOT been completed
        if (booking.paymentMethod === 'vnpay' && booking.paymentStatus !== 'paid') {
            return res.status(400).json({ message: '⚠️ Khách chưa hoàn tất thanh toán VNPay Online! Không thể Check-in.' });
        }

        if (booking.isCheckedIn) {
            return res.status(400).json({ message: 'Vé này đã được check-in trước đó rồi!' });
        }

        const now = new Date();
        booking.isCheckedIn = true;
        booking.checkedInAt = now;
        booking.status = 'confirmed';
        if (booking.paymentMethod === 'cash') {
            booking.paymentStatus = 'paid';
        }
        
        if (!booking.checkInHistory) booking.checkInHistory = [];
        booking.checkInHistory.push({
            action: 'checkin',
            reason: 'Soát vé thành công cho khách hàng',
            timestamp: now
        });

        const updatedBooking = await booking.save();

        // Trừ kho đồ ăn khi Check-in thành công
        await deductFoodStock(updatedBooking);

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel check-in for ticket at cinema (Requires reason)
// @route   PUT /api/bookings/:id/cancel-checkin
exports.cancelCheckinBooking = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập/chọn lý do hủy Check-in!' });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy vé đặt!' });
        }

        if (!booking.isCheckedIn) {
            return res.status(400).json({ message: 'Vé này hiện chưa ở trạng thái Check-in, không thể hủy!' });
        }

        const now = new Date();
        booking.isCheckedIn = false;
        booking.checkInCancelReason = reason.trim();
        booking.checkInCancelledAt = now;

        if (!booking.checkInHistory) booking.checkInHistory = [];
        booking.checkInHistory.push({
            action: 'cancel_checkin',
            reason: reason.trim(),
            timestamp: now
        });

        const updatedBooking = await booking.save();
        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const Movie = require('../models/Movie');

        const confirmedBookings = await Booking.find({ status: 'confirmed' })
            .populate({
                path: 'showtime',
                populate: { path: 'movie', select: 'title poster' }
            });

        const totalUsers = await User.countDocuments({});
        const totalMovies = await Movie.countDocuments({});
        const totalBookingsCount = await Booking.countDocuments({});
        const totalConfirmedBookings = confirmedBookings.length;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalRevenue = 0;
        let todayRevenue = 0;
        let todayBookings = 0;
        let monthRevenue = 0;
        let monthBookings = 0;

        let vnpayRevenue = 0;
        let vnpayCount = 0;
        let cashRevenue = 0;
        let cashCount = 0;

        const movieMap = {};
        const dailyMap = {};
        const monthlyMap = {};

        // Initialize last 7 days in dailyMap
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`;
            dailyMap[key] = { key, dateLabel, revenue: 0, bookings: 0, seats: 0 };
        }

        // Initialize last 6 months in monthlyMap
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
            monthlyMap[key] = { key, monthLabel, revenue: 0, bookings: 0 };
        }

        confirmedBookings.forEach(b => {
            const rev = b.totalPrice || 0;
            const created = new Date(b.createdAt);
            const seatCount = b.seats ? b.seats.length : 0;

            totalRevenue += rev;

            if (created >= startOfToday) {
                todayRevenue += rev;
                todayBookings += 1;
            }

            if (created >= startOfMonth) {
                monthRevenue += rev;
                monthBookings += 1;
            }

            if (b.paymentMethod === 'vnpay') {
                vnpayRevenue += rev;
                vnpayCount += 1;
            } else {
                cashRevenue += rev;
                cashCount += 1;
            }

            // Daily chart grouping
            const dayKey = created.toISOString().split('T')[0];
            if (dailyMap[dayKey]) {
                dailyMap[dayKey].revenue += rev;
                dailyMap[dayKey].bookings += 1;
                dailyMap[dayKey].seats += seatCount;
            }

            // Monthly chart grouping
            const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyMap[monthKey]) {
                monthlyMap[monthKey].revenue += rev;
                monthlyMap[monthKey].bookings += 1;
            }

            // Top movies grouping
            if (b.showtime && b.showtime.movie) {
                const m = b.showtime.movie;
                const mId = m._id ? m._id.toString() : 'unknown';
                if (!movieMap[mId]) {
                    movieMap[mId] = {
                        _id: mId,
                        title: m.title || 'Phim chưa đặt tên',
                        poster: m.poster || '',
                        totalRevenue: 0,
                        totalTickets: 0,
                        totalBookings: 0
                    };
                }
                movieMap[mId].totalRevenue += rev;
                movieMap[mId].totalTickets += seatCount;
                movieMap[mId].totalBookings += 1;
            }
        });

        const topMovies = Object.values(movieMap)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);

        const dailyRevenue = Object.values(dailyMap);
        const monthlyRevenue = Object.values(monthlyMap);

        res.json({
            totalRevenue,
            todayRevenue,
            todayBookings,
            monthRevenue,
            monthBookings,
            totalUsers,
            totalMovies,
            totalBookings: totalConfirmedBookings || totalBookingsCount,
            dailyRevenue,
            monthlyRevenue,
            paymentStats: {
                vnpayRevenue,
                vnpayCount,
                cashRevenue,
                cashCount
            },
            topMovies
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
