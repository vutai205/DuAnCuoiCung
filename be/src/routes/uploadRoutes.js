const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middlewares/authMiddleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer lưu file vào thư mục 'uploads/'
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir); // Lưu file ở thư mục gốc của be/uploads
    },
    filename(req, file, cb) {
        // Đặt tên file = tên gốc + thời gian hiện tại để tránh trùng lặp
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Hàm kiểm tra định dạng file (Chỉ cho phép ảnh)
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), (req, res) => {
    // Trả về đường dẫn của file để Frontend hiển thị và lưu vào DB
    res.json({
        message: 'Image Uploaded successfully',
        imageUrl: `/uploads/${req.file.filename}`
    });
});

module.exports = router;
