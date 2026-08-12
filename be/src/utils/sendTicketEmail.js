const sendEmail = require('./sendEmail');
const Booking = require('../models/Booking');
const QRCode = require('qrcode');

/**
 * Sends a detailed ticket confirmation email to the customer upon successful booking/payment.
 * @param {string} bookingId 
 */
const sendTicketEmail = async (bookingId) => {
    try {
        const booking = await Booking.findById(bookingId)
            .populate('user', 'name email phone')
            .populate({
                path: 'showtime',
                populate: { path: 'movie room' }
            });

        if (!booking || !booking.user || !booking.user.email) {
            console.log(`[Email] Skipping ticket email: Booking ${bookingId} or User Email not found.`);
            return;
        }

        const movieTitle = booking.showtime?.movie?.title || 'Phim chiếu rạp';
        const roomName = booking.showtime?.room?.name || 'Phòng chiếu TNA';
        const startTimeStr = booking.showtime?.startTime 
            ? new Date(booking.showtime.startTime).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) 
            : 'N/A';
        const seatsStr = booking.seats ? booking.seats.join(', ') : 'N/A';
        const combosStr = booking.combos && booking.combos.length > 0
            ? booking.combos.map(c => `${c.name} (x${c.count})`).join(', ')
            : 'Không';
        const formattedTotal = booking.totalPrice ? booking.totalPrice.toLocaleString('vi-VN') + ' đ' : '0 đ';
        const paymentMethodStr = booking.paymentMethod === 'cash' ? '💵 Thanh toán tại quầy' : '💳 Thanh toán VNPay Online';
        const ticketCode = booking.ticketCode || booking._id.toString();

        // Generate QR code buffer for inline email attachment (CID)
        let qrBuffer = null;
        try {
            qrBuffer = await QRCode.toBuffer(ticketCode, {
                errorCorrectionLevel: 'H',
                type: 'png',
                margin: 1,
                width: 250,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        } catch (qrErr) {
            console.error('[Email QR Generator Error]', qrErr);
        }

        const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 20px; color: #ffffff;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
                <div style="background-color: #e50914; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; text-transform: uppercase;">🎬 TNA CINEMA</h1>
                    <p style="margin: 5px 0 0 0; color: #fecdd3; font-size: 14px;">XÁC NHẬN ĐẶT VÉ THÀNH CÔNG</p>
                </div>

                <div style="padding: 24px; line-height: 1.6;">
                    <p style="font-size: 16px; margin-top: 0;">Xin chào <strong>${booking.user.name || 'Khách hàng'}</strong>,</p>
                    <p>Cảm ơn bạn đã lựa chọn <strong>TNA CINEMA</strong>. Chi tiết vé xem phim của bạn như sau:</p>

                    <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e50914;">
                        <p style="margin: 4px 0; font-size: 16px; color: #f87171;">
                            MÃ VÉ: <strong style="font-size: 18px; color: #ffffff;">#${ticketCode}</strong>
                        </p>
                        <p style="margin: 4px 0;">🎬 <strong>Phim:</strong> ${movieTitle}</p>
                        <p style="margin: 4px 0;">🚪 <strong>Phòng chiếu:</strong> ${roomName}</p>
                        <p style="margin: 4px 0;">⏰ <strong>Suất chiếu:</strong> ${startTimeStr}</p>
                        <p style="margin: 4px 0;">💺 <strong>Ghế đã chọn:</strong> <span style="color: #fbbf24; font-weight: bold;">${seatsStr}</span></p>
                        ${combosStr !== 'Không' ? `<p style="margin: 4px 0;">🍿 <strong>Bỏng nước:</strong> ${combosStr}</p>` : ''}
                        ${booking.discountAmount > 0 ? `<p style="margin: 4px 0; color: #34d399;">🎟️ <strong>Voucher giảm giá:</strong> -${booking.discountAmount.toLocaleString('vi-VN')} đ (${booking.voucherCode})</p>` : ''}
                        <p style="margin: 8px 0 0 0; font-size: 16px; color: #34d399;">
                            💰 <strong>Tổng thanh toán:</strong> <strong style="font-size: 18px; color: #34d399;">${formattedTotal}</strong> (${paymentMethodStr})
                        </p>
                    </div>

                    ${qrBuffer ? `
                    <!-- KHUNG MÃ QR VÉ -->
                    <div style="text-align: center; margin: 24px 0; padding: 20px; background-color: #0f172a; border-radius: 10px; border: 2px dashed #e50914;">
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #fbbf24; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                            📱 MÃ QR XÁC NHẬN ĐƠN VÉ (QUÉT TẠI QUẦY RẠP)
                        </p>
                        <div style="display: inline-block; padding: 12px; background-color: #ffffff; border-radius: 10px;">
                            <img src="cid:ticketqrcode" alt="Mã QR Đặt Vé" style="width: 180px; height: 180px; display: block; margin: 0 auto;" />
                        </div>
                        <p style="margin: 12px 0 0 0; font-size: 15px; color: #ffffff; font-weight: bold; letter-spacing: 1px;">
                            MÃ VÉ: ${ticketCode}
                        </p>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">
                            (Đưa mã QR này cho nhân viên soát vé hoặc nhân viên quầy rạp để quét)
                        </p>
                    </div>
                    ` : ''}

                    <div style="background-color: #334155; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #cbd5e1;">
                        💡 <strong>Lưu ý:</strong> Vui lòng đưa Mã vé này hoặc mã QR trên điện thoại cho nhân viên tại quầy vé TNA Cinema để đổi phôi vé giấy trước giờ chiếu 15 phút.
                    </div>

                    <p style="margin-top: 24px; text-align: center; color: #94a3b8; font-size: 13px;">
                        Chúc bạn có những giây phút xem phim tuyệt vời tại <strong>TNA CINEMA</strong>!
                    </p>
                </div>
            </div>
        </div>
        `;

        const mailOptions = {
            email: booking.user.email,
            subject: `[TNA CINEMA] Xác nhận đặt vé thành công #${ticketCode}`,
            message: `Xác nhận đặt vé thành công phim ${movieTitle}. Mã vé: ${ticketCode}`,
            html: htmlContent
        };

        if (qrBuffer) {
            mailOptions.attachments = [
                {
                    filename: `qrcode-${ticketCode}.png`,
                    content: qrBuffer,
                    cid: 'ticketqrcode'
                }
            ];
        }

        await sendEmail(mailOptions);

        console.log(`[Email] Ticket email sent successfully to ${booking.user.email} for booking ${booking._id}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send ticket confirmation email:`, error.message);
    }
};

module.exports = sendTicketEmail;
