const express = require('express');
const router = express.Router();
const { 
    getMovieReviews, 
    createReview, 
    getAllReviewsAdmin, 
    toggleHideReviewAdmin, 
    replyReviewAdmin 
} = require('../controllers/reviewController');
const { protect, admin, optionalAuth } = require('../middlewares/authMiddleware');

router.get('/movie/:movieId', optionalAuth, getMovieReviews);
router.post('/', protect, createReview);

// Admin Routes
router.get('/', protect, admin, getAllReviewsAdmin);
router.put('/:id/toggle-hide', protect, admin, toggleHideReviewAdmin);
router.delete('/:id', protect, admin, toggleHideReviewAdmin); // Soft-hide instead of hard delete
router.put('/:id/reply', protect, admin, replyReviewAdmin);

module.exports = router;
