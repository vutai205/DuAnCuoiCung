const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// Helper email regex
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Vui lòng nhập họ và tên!' });
        }

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ message: 'Địa chỉ Email không đúng định dạng!' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 6 ký tự!' });
        }

        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({ message: 'Email này đã được đăng ký tài khoản khác!' });
        }

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ message: 'Vui lòng nhập Email hợp lệ!' });
        }

        if (!password) {
            return res.status(400).json({ message: 'Vui lòng nhập mật khẩu!' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác!' });
        }

        // Kiểm tra xem tài khoản có bị khóa không
        if (user.status === false) {
            return res.status(403).json({ message: '⛔ Tài khoản của bạn đã bị khóa bởi Quản trị viên. Vui lòng liên hệ bộ phận hỗ trợ!' });
        }

        if (await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' });
        }

        // Tạo mã OTP 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Lưu vào DB, hạn 10 phút
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        const message = `Xin chào ${user.name},\n\nMã OTP để đặt lại mật khẩu của bạn là: ${otp}\n\nMã này sẽ hết hạn trong 10 phút.\nNếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.`;

        // Log OTP ra console backend để hỗ trợ dev kiểm tra
        console.log(`\n==========================================`);
        console.log(`🔑 [OTP SYSTEM] Mã OTP đặt lại mật khẩu cho [${user.email}] là: ${otp}`);
        console.log(`==========================================\n`);

        try {
            await sendEmail({
                email: user.email,
                subject: 'Mã OTP Đặt Lại Mật Khẩu - Hệ Thống Đặt Vé',
                message
            });
            console.log(`✅ [EMAIL SUCCESS] Đã gửi mã OTP thành công về email: ${user.email}`);
            res.status(200).json({ message: 'Đã gửi mã OTP 6 chữ số về email của bạn. Vui lòng kiểm tra hộp thư!' });
        } catch (error) {
            console.error('Lỗi gửi Email:', error.message);
            res.status(500).json({ message: `Không thể gửi email: ${error.message}` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordOtpExpire: { $gt: Date.now() } // OTP còn hạn
        });

        if (!user) {
            return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
        }

        // Cập nhật mật khẩu
        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
