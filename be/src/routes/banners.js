const express = require('express');
const router = express.Router();
const { 
    getActiveBanners, 
    getAllBanners, 
    getBannerById, 
    createBanner, 
    updateBanner, 
    deleteBanner 
} = require('../controllers/bannerController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public route for frontend display
router.route('/')
    .get(getActiveBanners);

// Admin routes
router.use(protect);
router.use(admin);

router.route('/admin')
    .get(getAllBanners);

router.route('/')
    .post(createBanner);

router.route('/:id')
    .get(getBannerById)
    .put(updateBanner)
    .delete(deleteBanner);

module.exports = router;
