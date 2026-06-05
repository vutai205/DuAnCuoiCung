const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookings, getDashboardStats, updateBookingStatus } = require('../controllers/bookingController');
const { protect, admin } = require('../middlewares/authMiddleware');

// User routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);

// Admin routes
router.get('/stats', protect, admin, getDashboardStats);
router.get('/', protect, admin, getBookings);
router.put('/:id/status', protect, admin, updateBookingStatus);

module.exports = router;
