const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/duancuoicung';
    try {
        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
        console.error(`--------------------------------------------------`);
        console.error(`👉 HƯỚNG DẪN XỬ LÝ CHO THÀNH VIÊN KHÁC KHI TẢI CODE:`);
        console.error(`1. Nếu dùng MongoDB Atlas (Cloud): Bạn cần vào MongoDB Atlas -> Network Access -> Thêm IP "0.0.0.0/0" (Allow Access From Anywhere) để máy thành viên khác cũng truy cập được.`);
        console.error(`2. Nếu dùng MongoDB Local: Đảm bảo đã bật MongoDB Service trên máy hoặc cài MongoDB Compass.`);
        console.error(`--------------------------------------------------`);
        
        // Thử kết nối fallback Local nếu Atlas bị chặn
        if (mongoURI.includes('mongodb+srv')) {
            console.log('🔄 Đang thử kết nối lại với MongoDB Local (mongodb://127.0.0.1:27017/duancuoicung)...');
            try {
                const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/duancuoicung');
                console.log(`✅ Đã kết nối thành công tới MongoDB Local: ${localConn.connection.host}`);
                return;
            } catch (localError) {
                console.error(`❌ Không thể kết nối MongoDB Local: ${localError.message}`);
            }
        }

        process.exit(1);
    }
};

module.exports = connectDB;
