const express = require('express');
const router = express.Router();
const { getMovieReviews, createReview } = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');

router.get('/movie/:movieId', optionalAuth, getMovieReviews);
router.post('/', protect, createReview);

module.exports = router;
