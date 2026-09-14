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
const { protect, admin, protectAdminOrStaff } = require('../middlewares/authMiddleware');

// Admin & Staff routes (Tác nghiệp đơn vé, soát vé QR, in vé quầy & tổng quan)
router.get('/stats', protect, protectAdminOrStaff, getDashboardStats);
router.get('/', protect, protectAdminOrStaff, getBookings);
router.put('/:id/status', protect, protectAdminOrStaff, updateBookingStatus);
router.put('/:id/print', protect, protectAdminOrStaff, printBookingTicket);
router.put('/:id/checkin', protect, protectAdminOrStaff, checkinBooking);
router.put('/:id/cancel-checkin', protect, protectAdminOrStaff, cancelCheckinBooking);

// User routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);

module.exports = router;
