const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings } = require('../controllers/bookingController');

const { protect } = require('../middlewares/authMiddleware');

// Áp dụng middleware "protect" để bắt buộc người dùng phải đăng nhập mới được gọi API này
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);

module.exports = router;
