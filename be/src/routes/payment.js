const express = require('express');
const router = express.Router();
const { createPaymentUrl, vnpayReturn } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// Route tạo URL thanh toán (Bắt buộc phải đăng nhập mới được tạo)
router.post('/create_payment_url', protect, createPaymentUrl);

// Route hứng kết quả từ VNPay (Public để VNPay gọi vào)
router.get('/vnpay_return', vnpayReturn);

module.exports = router;
