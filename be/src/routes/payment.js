const express = require('express');
const router = express.Router();
const { createPaymentUrl, vnpayReturn, createMomoUrl, momoReturn } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// Route tạo URL thanh toán VNPay
router.post('/create_payment_url', protect, createPaymentUrl);

// Route hứng kết quả từ VNPay (Public)
router.get('/vnpay_return', vnpayReturn);

// Route tạo URL thanh toán MoMo Sandbox
router.post('/create_momo_url', protect, createMomoUrl);

// Route hứng kết quả từ MoMo (Public)
router.get('/momo_return', momoReturn);
router.post('/momo_ipn', momoReturn);

module.exports = router;

