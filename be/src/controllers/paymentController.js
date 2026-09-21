const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');
const axios = require('axios');
const Booking = require('../models/Booking');
const { deductFoodStock } = require('./bookingController');

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
            const booking = await Booking.findById(bookingId);
            if (booking) {
                booking.status = 'confirmed';
                booking.paymentStatus = 'paid';
                booking.expiresAt = null;
                await booking.save();
                await deductFoodStock(booking);

                // Send confirmation ticket email asynchronously
                const sendTicketEmail = require('../utils/sendTicketEmail');
                sendTicketEmail(bookingId).catch(err => console.error("[Email Error]", err));
            }
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

// @desc    Tạo link thanh toán MoMo Sandbox
// @route   POST /api/payment/create_momo_url
// @access  Private
exports.createMomoUrl = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
        const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECBC6517';
        const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6FA29CD0EE35C27E36963EC80A4';
        const endpoint = process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/create';
        const redirectUrl = process.env.MOMO_RETURN_URL || 'http://localhost:5001/api/payment/momo_return';
        const ipnUrl = process.env.MOMO_NOTIFY_URL || 'http://localhost:5001/api/payment/momo_ipn';

        const orderId = `${bookingId}_${Date.now()}`;
        const requestId = orderId;
        const orderInfo = `Thanh toan ve xem phim TNA Cinema #${bookingId}`;
        const requestType = 'captureWallet';
        const extraData = '';
        const lang = 'vi';

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        const requestBody = {
            partnerCode,
            partnerName: 'TNA CINEMA',
            storeId: 'TNACinemaStore',
            requestId,
            amount: String(amount),
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang,
            requestType,
            autoCapture: true,
            extraData,
            signature
        };

        const momoGatewayUrl = `http://localhost:5173/momo-payment?orderId=${orderId}&amount=${amount}&bookingId=${bookingId}&orderInfo=${encodeURIComponent(orderInfo)}`;

        try {
            const response = await axios.post(endpoint, requestBody, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data && response.data.payUrl) {
                return res.status(200).json({ paymentUrl: response.data.payUrl });
            } else {
                return res.status(200).json({ paymentUrl: momoGatewayUrl });
            }
        } catch (momoErr) {
            console.warn('MoMo Gateway sandbox routing to interactive gateway page');
            return res.status(200).json({ paymentUrl: momoGatewayUrl });
        }
    } catch (error) {
        console.error('Lỗi MoMo Create:', error.response?.data || error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Hứng kết quả trả về từ MoMo sau khi khách thanh toán xong
// @route   GET /api/payment/momo_return
// @access  Public
exports.momoReturn = async (req, res) => {
    try {
        const { orderId, resultCode } = req.query;

        // Trích xuất bookingId nguyên bản từ orderId
        const bookingId = orderId ? orderId.split('_')[0] : null;

        if (!bookingId) {
            return res.redirect('http://localhost:5173/payment-failed');
        }

        if (String(resultCode) === '0') {
            // Thanh toán MoMo thành công -> Cập nhật DB
            const booking = await Booking.findById(bookingId);
            if (booking) {
                booking.status = 'confirmed';
                booking.paymentStatus = 'paid';
                booking.expiresAt = null;
                await booking.save();
                await deductFoodStock(booking);

                // Gửi Email vé điện tử
                const sendTicketEmail = require('../utils/sendTicketEmail');
                sendTicketEmail(bookingId).catch(err => console.error("[Email Error]", err));
            }
            if (req.query.json === 'true' || req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
                return res.status(200).json({ success: true, bookingId, redirectUrl: `/payment-success?bookingId=${bookingId}` });
            }
            return res.redirect(`http://localhost:5173/payment-success?bookingId=${bookingId}`);
        } else {
            // Thanh toán thất bại hoặc người dùng hủy
            await Booking.findByIdAndUpdate(bookingId, {
                status: 'cancelled',
                paymentStatus: 'failed'
            });
            if (req.query.json === 'true' || req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
                return res.status(200).json({ success: false, bookingId, redirectUrl: `/payment-failed?bookingId=${bookingId}` });
            }
            return res.redirect(`http://localhost:5173/payment-failed?bookingId=${bookingId}`);
        }
    } catch (error) {
        console.error('Lỗi MoMo Return:', error);
        res.status(500).json({ message: error.message });
    }
};

