const express = require('express');
const router = express.Router();
const { getShowtimesByMovie, getShowtimeSeats, getShowtimes, createShowtime, createBatchShowtimes, updateShowtime, deleteShowtime } = require('../controllers/showtimeController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/movie/:movieId', getShowtimesByMovie);
router.get('/:id/seats', getShowtimeSeats);

// Admin routes
router.route('/')
    .get(getShowtimes)
    .post(protect, admin, createShowtime);

router.post('/batch', protect, admin, createBatchShowtimes);

router.route('/:id')
    .put(protect, admin, updateShowtime)
    .delete(protect, admin, deleteShowtime);

module.exports = router;
