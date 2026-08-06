const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');
const Booking = require('../models/Booking');

// Hàm hỗ trợ sắp xếp các tham số để tạo chữ ký (Bắt buộc bởi VNPay)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// @desc    Tạo link thanh toán VNPay
// @route   POST /api/payment/create_payment_url
// @access  Private
exports.createPaymentUrl = async (req, res) => {
    try {
        const { bookingId, amount, bankCode } = req.body;
        
        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = process.env.VNP_RETURN_URL;

        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        
        // Cấu hình các tham số gửi sang VNPay
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = bookingId; // Mã đơn hàng (Dùng luôn ID booking)
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + bookingId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu nhân 100
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = createDate;

        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // 1. Sắp xếp dữ liệu
        vnp_Params = sortObject(vnp_Params);

        // 2. Mã hóa dữ liệu (Tạo chữ ký điện tử chống giả mạo)
        let signData = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;

        // 3. Nối tham số vào URL
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        res.status(200).json({ paymentUrl: vnpUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Hứng kết quả trả về từ VNPay sau khi khách thanh toán xong
// @route   GET /api/payment/vnpay_return
// @access  Public
exports.vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    // Lọc bỏ 2 tham số hash trước khi mã hóa lại
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp lại giống lúc gửi
    vnp_Params = sortObject(vnp_Params);
    let secretKey = process.env.VNP_HASH_SECRET;
    let signData = qs.stringify(vnp_Params, { encode: false });
    
    // Tạo lại chữ ký
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    // So sánh chữ ký VNPay gửi về với chữ ký mình tự tạo
    if (secureHash === signed) {
        const bookingId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];

        if (responseCode === '00') {
            // Thanh toán thành công (00) -> Cập nhật DB
            await Booking.findByIdAndUpdate(bookingId, { 
                status: 'confirmed', 
                paymentStatus: 'paid' 
            });
            // Đá khách hàng về Frontend trang Thành công
            return res.redirect(`http://localhost:5173/payment-success?bookingId=${bookingId}`);
        } else {
            // Khách hủy thanh toán hoặc quẹt thẻ lỗi -> Cập nhật DB
            await Booking.findByIdAndUpdate(bookingId, { 
                status: 'cancelled', 
                paymentStatus: 'failed' 
            });
            // Đá khách hàng về Frontend trang Thất bại
            return res.redirect(`http://localhost:5173/payment-failed?bookingId=${bookingId}`);
        }
    } else {
        // Có người cố tình sửa kết quả trên thanh URL (Hacker)
        res.status(400).json({ message: 'Lỗi xác thực chữ ký (Checksum Failed)' });
    }
};
