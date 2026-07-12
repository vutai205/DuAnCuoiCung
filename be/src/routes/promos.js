const express = require('express');
const router = express.Router();
const { getActivePromos, validatePromo } = require('../controllers/promoController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getActivePromos);
router.post('/validate', protect, validatePromo);

module.exports = router;
