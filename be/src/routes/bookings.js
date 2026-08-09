const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getMyBookings, 
    getBookings, 
    getBookingById,
    getDashboardStats, 
    updateBookingStatus,
    printBookingTicket,
    checkinBooking,
    cancelCheckinBooking
} = require('../controllers/bookingController');
const { protect, admin } = require('../middlewares/authMiddleware');

// User routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);

// Admin routes
router.get('/stats', protect, admin, getDashboardStats);
router.get('/', protect, admin, getBookings);
router.put('/:id/status', protect, admin, updateBookingStatus);
router.put('/:id/print', protect, admin, printBookingTicket);
router.put('/:id/checkin', protect, admin, checkinBooking);
router.put('/:id/cancel-checkin', protect, admin, cancelCheckinBooking);

module.exports = router;
