const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header (dạng "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            // Tìm user dựa trên ID trong token và gán vào req.user (loại bỏ trường password)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Cho phép đi tiếp vào Controller
        } catch (error) {
            res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ!' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Không có quyền truy cập, không tìm thấy token!' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập, chỉ dành cho Quản trị viên (Admin)!' });
    }
};

module.exports = { protect, admin };
