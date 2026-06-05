const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings } = require('../controllers/bookingController');

// Using basic routes without authentication middleware for now.
// In a full implementation, you'd add a `protect` middleware here.
router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);

module.exports = router;
