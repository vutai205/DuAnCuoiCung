const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://thinhdo1551_db_user:Thinhdo3107@cluster0.ejqrq2c.mongodb.net/duancuoicung?appName=Cluster0';

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || ATLAS_URI;
    try {
        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
        
        // Thử lại trực tiếp bằng Atlas URI phòng trường hợp file .env lỗi
        if (mongoURI !== ATLAS_URI) {
            console.log('🔄 Đang kết nối trực tiếp Atlas Cloud DB...');
            try {
                const atlasConn = await mongoose.connect(ATLAS_URI);
                console.log(`✅ Kết nối thành công Atlas Cloud: ${atlasConn.connection.host}`);
                return;
            } catch (err) {
                console.error(`❌ Thất bại: ${err.message}`);
            }
        }
        process.exit(1);
    }
};

module.exports = connectDB;
