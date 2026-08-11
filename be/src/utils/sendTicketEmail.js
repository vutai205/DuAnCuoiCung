const sendEmail = require('./sendEmail');
const Booking = require('../models/Booking');

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
                            MÃ VÉ: <strong style="font-size: 18px; color: #ffffff;">#${booking.ticketCode || booking._id}</strong>
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

        await sendEmail({
            email: booking.user.email,
            subject: `[TNA CINEMA] Xác nhận đặt vé thành công #${booking.ticketCode || booking._id.toString().slice(-8).toUpperCase()}`,
            message: `Xác nhận đặt vé thành công phim ${movieTitle}. Mã vé: ${booking.ticketCode || booking._id}`,
            html: htmlContent
        });

        console.log(`[Email] Ticket email sent successfully to ${booking.user.email} for booking ${booking._id}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send ticket confirmation email:`, error.message);
    }
};

module.exports = sendTicketEmail;
