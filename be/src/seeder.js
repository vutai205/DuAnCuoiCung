require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const createAdmin = async () => {
    try {
        await connectDB();

        // Kiểm tra xem đã có admin chưa
        const adminExists = await User.findOne({ email: 'admin@gmail.com' });

        if (adminExists) {
            console.log('Tài khoản Admin đã tồn tại!');
            process.exit();
        }

        // Tạo tài khoản admin
        const adminUser = new User({
            name: 'Quản trị viên',
            email: 'admin@gmail.com',
            password: 'password123', // Mật khẩu sẽ tự động được băm (hash) nhờ hàm pre-save trong Model
            role: 'admin'
        });

        await adminUser.save();
        console.log('Đã tạo thành công tài khoản Admin mặc định!');
        process.exit();
    } catch (error) {
        console.error(`Lỗi: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
