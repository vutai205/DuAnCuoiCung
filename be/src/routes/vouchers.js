const express = require('express');
const router = express.Router();
const {
    getVouchers,
    getPublicVouchers,
    createVoucher,
    validateVoucher,
    toggleVoucherStatus,
    deleteVoucher
} = require('../controllers/voucherController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public/Customer routes
router.get('/public', getPublicVouchers);
router.post('/validate', validateVoucher);

// Admin routes
router.get('/', protect, admin, getVouchers);
router.post('/', protect, admin, createVoucher);
router.put('/:id/toggle', protect, admin, toggleVoucherStatus);
router.delete('/:id', protect, admin, deleteVoucher);

module.exports = router;
