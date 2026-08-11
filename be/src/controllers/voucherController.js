const Voucher = require('../models/Voucher');

// @desc    Get all vouchers (Admin)
// @route   GET /api/vouchers
exports.getVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active public vouchers for customer selection
// @route   GET /api/vouchers/public
exports.getPublicVouchers = async (req, res) => {
    try {
        const now = new Date();
        const vouchers = await Voucher.find({
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        }).select('code description discountType discountValue minOrderValue maxDiscount expiresAt');
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new voucher (Admin)
// @route   POST /api/vouchers
exports.createVoucher = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minOrderValue,
            maxDiscount,
            usageLimit,
            expiresAt
        } = req.body;

        if (!code || discountValue === undefined || discountValue === null) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ mã voucher và giá trị giảm!' });
        }

        const existingVoucher = await Voucher.findOne({ code: code.trim().toUpperCase() });
        if (existingVoucher) {
            return res.status(400).json({ message: `Mã Voucher "${code.trim().toUpperCase()}" đã tồn tại trong hệ thống!` });
        }

        const voucher = await Voucher.create({
            code: code.trim().toUpperCase(),
            description: description || '',
            discountType: discountType || 'fixed',
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue) || 0,
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            usageLimit: usageLimit !== undefined ? Number(usageLimit) : 100,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            isActive: true
        });

        res.status(201).json(voucher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate voucher code & calculate discount
// @route   POST /api/vouchers/validate
exports.validateVoucher = async (req, res) => {
    try {
        const { code, orderTotal = 0 } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập mã Voucher!' });
        }

        const cleanCode = code.trim().toUpperCase();
        const voucher = await Voucher.findOne({ code: cleanCode });

        if (!voucher) {
            return res.status(404).json({ message: `Mã Voucher "${cleanCode}" không tồn tại hoặc đã hết hạn!` });
        }

        if (!voucher.isActive) {
            return res.status(400).json({ message: `Mã Voucher "${cleanCode}" đang tạm dừng áp dụng!` });
        }

        if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
            return res.status(400).json({ message: `Mã Voucher "${cleanCode}" đã hết hạn sử dụng!` });
        }

        if (voucher.usedCount >= voucher.usageLimit) {
            return res.status(400).json({ message: `Mã Voucher "${cleanCode}" đã hết lượt sử dụng!` });
        }

        if (orderTotal < voucher.minOrderValue) {
            return res.status(400).json({
                message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')} đ mới có thể áp dụng mã "${cleanCode}"!`
            });
        }

        let discountAmount = 0;
        if (voucher.discountType === 'fixed') {
            discountAmount = voucher.discountValue;
        } else if (voucher.discountType === 'percent') {
            discountAmount = (orderTotal * voucher.discountValue) / 100;
            if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
                discountAmount = voucher.maxDiscount;
            }
        }

        // Discount cannot exceed order total
        discountAmount = Math.min(discountAmount, orderTotal);

        res.json({
            valid: true,
            voucher: {
                _id: voucher._id,
                code: voucher.code,
                description: voucher.description,
                discountType: voucher.discountType,
                discountValue: voucher.discountValue
            },
            discountAmount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle voucher status (Admin)
// @route   PUT /api/vouchers/:id/toggle
exports.toggleVoucherStatus = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (!voucher) {
            return res.status(404).json({ message: 'Không tìm thấy Voucher này!' });
        }

        voucher.isActive = !voucher.isActive;
        await voucher.save();
        res.json(voucher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete voucher (Admin)
// @route   DELETE /api/vouchers/:id
exports.deleteVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (!voucher) {
            return res.status(404).json({ message: 'Không tìm thấy Voucher này!' });
        }

        await voucher.deleteOne();
        res.json({ message: 'Xóa mã Voucher thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
