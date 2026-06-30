const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
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

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
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

        // Gửi email
        const message = `Xin chào ${user.name},\n\nMã OTP để đặt lại mật khẩu của bạn là: ${otp}\n\nMã này sẽ hết hạn trong 10 phút.\nNếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Mã OTP Đặt Lại Mật Khẩu - Hệ Thống Đặt Vé',
                message
            });
            res.status(200).json({ message: 'Đã gửi mã OTP về email của bạn' });
        } catch (error) {
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Lỗi hệ thống không thể gửi email. Vui lòng kiểm tra lại cấu hình EMAIL_USER và EMAIL_PASS trong .env' });
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
