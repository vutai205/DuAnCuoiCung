const PromoCode = require('../models/PromoCode');

function calculateDiscount(promo, orderTotal) {
    if (orderTotal < promo.minOrder) {
        return {
            valid: false,
            message: `Đơn hàng tối thiểu ${promo.minOrder.toLocaleString('vi-VN')}đ để dùng mã này`,
        };
    }

    let discount = promo.discountType === 'percent'
        ? Math.round(orderTotal * promo.discountValue / 100)
        : promo.discountValue;

    discount = Math.min(discount, orderTotal);

    return {
        valid: true,
        discount,
        finalPrice: orderTotal - discount,
        promo: {
            code: promo.code,
            title: promo.title,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
        },
    };
}

exports.getActivePromos = async (req, res) => {
    try {
        const now = new Date();
        const promos = await PromoCode.find({
            isActive: true,
            expiresAt: { $gt: now },
            $or: [
                { maxUses: null },
                { $expr: { $lt: ['$usedCount', '$maxUses'] } },
            ],
        }).sort({ createdAt: -1 });

        res.json(promos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.validatePromo = async (req, res) => {
    try {
        const { code, orderTotal } = req.body;

        if (!code || orderTotal == null) {
            return res.status(400).json({ message: 'Thiếu mã giảm giá hoặc tổng tiền đơn hàng' });
        }

        const promo = await PromoCode.findOne({
            code: code.toUpperCase().trim(),
            isActive: true,
            expiresAt: { $gt: new Date() },
        });

        if (!promo) {
            return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
        }

        if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
        }

        const result = calculateDiscount(promo, Number(orderTotal));
        if (!result.valid) {
            return res.status(400).json({ message: result.message });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.applyPromoToOrder = async (code, orderTotal) => {
    const promo = await PromoCode.findOne({
        code: code.toUpperCase().trim(),
        isActive: true,
        expiresAt: { $gt: new Date() },
    });

    if (!promo) {
        throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
        throw new Error('Mã giảm giá đã hết lượt sử dụng');
    }

    const result = calculateDiscount(promo, orderTotal);
    if (!result.valid) {
        throw new Error(result.message);
    }

    promo.usedCount += 1;
    await promo.save();

    return { promo, ...result };
};
