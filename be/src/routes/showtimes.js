const express = require('express');
const router = express.Router();
const { getShowtimesByMovie, getShowtimeSeats } = require('../controllers/showtimeController');

router.get('/movie/:movieId', getShowtimesByMovie);
router.get('/:id/seats', getShowtimeSeats);

module.exports = router;
