require('dotenv').config();
const connectDB = require('./config/db');
const PromoCode = require('./models/PromoCode');

const defaultPromos = [
    {
        code: 'CINE10',
        title: 'Giảm 10% vé xem phim',
        description: 'Áp dụng cho mọi suất chiếu, giảm 10% tổng hóa đơn.',
        discountType: 'percent',
        discountValue: 10,
        minOrder: 0,
        maxUses: 100,
        expiresAt: new Date('2026-12-31'),
    },
    {
        code: 'CINE50K',
        title: 'Giảm 50.000đ',
        description: 'Giảm thẳng 50.000đ khi đặt từ 2 vé trở lên.',
        discountType: 'fixed',
        discountValue: 50000,
        minOrder: 100000,
        maxUses: 50,
        expiresAt: new Date('2026-12-31'),
    },
    {
        code: 'VIP20',
        title: 'Khách VIP giảm 20%',
        description: 'Ưu đãi đặc biệt giảm 20% cho đơn từ 200.000đ.',
        discountType: 'percent',
        discountValue: 20,
        minOrder: 200000,
        maxUses: 30,
        expiresAt: new Date('2026-12-31'),
    },
    {
        code: 'WEEKEND',
        title: 'Cuối tuần vui vẻ',
        description: 'Giảm 15% cho suất chiếu cuối tuần.',
        discountType: 'percent',
        discountValue: 15,
        minOrder: 80000,
        maxUses: null,
        expiresAt: new Date('2026-12-31'),
    },
];

const seedPromos = async () => {
    try {
        await connectDB();

        for (const promo of defaultPromos) {
            const exists = await PromoCode.findOne({ code: promo.code });
            if (!exists) {
                await PromoCode.create(promo);
                console.log(`Đã tạo mã: ${promo.code}`);
            }
        }

        console.log('Seed mã khuyến mại hoàn tất!');
        process.exit();
    } catch (error) {
        console.error(`Lỗi: ${error.message}`);
        process.exit(1);
    }
};

seedPromos();
