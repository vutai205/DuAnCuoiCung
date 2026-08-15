const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmail');

// POST /api/contact - Gửi phản hồi / liên hệ mới từ khách hàng
exports.createContact = async (req, res) => {
    try {
        const { fullname, phone, email, topic, message } = req.body;

        if (!fullname || !phone || !email || !message) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
        }

        const newContact = await Contact.create({
            fullname,
            phone,
            email,
            topic: topic || 'ticket_support',
            message
        });

        // Gửi email xác nhận tự động nếu có cấu hình nodemailer
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await sendEmail({
                    email: email,
                    subject: '[TNA CINEMA] Cảm ơn bạn đã gửi phản hồi / liên hệ',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #e50914;">TNA CINEMA - Xác nhận phản hồi</h2>
                            <p>Xin chào <strong>${fullname}</strong>,</p>
                            <p>Cảm ơn bạn đã gửi liên hệ tới TNA Cinema. Chúng tôi đã nhận được nội dung phản hồi của bạn:</p>
                            <blockquote style="background: #f4f4f4; padding: 10px 15px; border-left: 4px solid #e50914;">
                                <strong>Số điện thoại:</strong> ${phone}<br/>
                                <strong>Nội dung:</strong> ${message}
                            </blockquote>
                            <p>Đội ngũ CSKH của TNA Cinema sẽ kiểm tra và phản hồi tới bạn trong thời gian sớm nhất.</p>
                            <p>Trân trọng,<br/><strong>Cụm Rạp TNA Cinema</strong></p>
                        </div>
                    `
                });
            } catch (emailErr) {
                console.error('Lỗi khi gửi email xác nhận phản hồi:', emailErr.message);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Tạo thông tin liên hệ thành công!',
            data: newContact
        });
    } catch (err) {
        console.error('Lỗi khi lưu thông tin liên hệ:', err);
        res.status(500).json({ message: 'Lỗi máy chủ khi xử lý liên hệ!', error: err.message });
    }
};

// GET /api/contact - Lấy danh sách phản hồi (Dành cho Admin)
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách liên hệ!', error: err.message });
    }
};

// PUT /api/contact/:id/status - Cập nhật trạng thái phản hồi
exports.updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!contact) {
            return res.status(404).json({ message: 'Không tìm thấy liên hệ!' });
        }
        res.json({ success: true, data: contact });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái liên hệ!', error: err.message });
    }
};

// POST /api/contact/:id/reply - Admin phản hồi trực tiếp qua Email tới khách hàng
exports.replyContactEmail = async (req, res) => {
    try {
        const { emailSubject, replyMessage } = req.body;

        if (!replyMessage || !replyMessage.trim()) {
            return res.status(400).json({ message: 'Nội dung email phản hồi không được để trống!' });
        }

        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin liên hệ này!' });
        }

        // Gửi email trực tiếp cho người dùng
        const subject = emailSubject || `[TNA CINEMA] Phản hồi yêu cầu hỗ trợ #${contact._id.toString().slice(-6)}`;
        
        let emailSent = false;
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await sendEmail({
                    email: contact.email,
                    subject: subject,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <div style="background-color: #e50914; padding: 15px; text-align: center; border-radius: 6px 6px 0 0;">
                                <h2 style="color: #ffffff; margin: 0;">🎬 TNA CINEMA SUPPORT</h2>
                            </div>
                            <div style="padding: 20px;">
                                <p>Xin chào <strong>${contact.fullname}</strong>,</p>
                                <p>Cụm rạp TNA Cinema xin gửi lời phản hồi cho yêu cầu hỗ trợ của bạn:</p>
                                <div style="background-color: #f8fafc; padding: 12px 16px; border-left: 4px solid #64748b; margin: 15px 0; font-size: 14px;">
                                    <strong>Nội dung yêu cầu của bạn:</strong> "${contact.message}"
                                </div>
                                <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a; margin: 15px 0; font-size: 14px;">
                                    <strong>Nội dung phản hồi từ TNA Cinema:</strong><br/>
                                    <p style="margin-top: 8px; line-height: 1.6; color: #15803d; white-space: pre-line;">${replyMessage.trim()}</p>
                                </div>
                                <p style="font-size: 13px; color: #64748b; margin-top: 25px;">
                                    Nếu bạn cần hỗ trợ thêm, vui lòng phản hồi qua Email này hoặc gọi trực tiếp Hotline <strong>1900 6868</strong>.
                                </p>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
                                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                                    Ban Quản Lý Cụm Rạp TNA Cinema — Số 87 Láng Hạ, Đống Đa, Hà Nội
                                </p>
                            </div>
                        </div>
                    `
                });
                emailSent = true;
            } catch (mailErr) {
                console.error('Lỗi gửi mail phản hồi:', mailErr);
            }
        }

        // Cập nhật trạng thái và lưu phản hồi của Admin vào Database
        contact.adminReply = replyMessage.trim();
        contact.adminReplyAt = new Date();
        contact.status = 'resolved';
        await contact.save();

        res.json({
            success: true,
            emailSent: emailSent,
            message: emailSent 
                ? `Đã gửi Email phản hồi thành công tới ${contact.email} và cập nhật trạng thái!`
                : `Đã lưu phản hồi vào hệ thống (Chưa gửi mail do chưa cấu hình EMAIL_USER/EMAIL_PASS trong .env)!`,
            data: contact
        });
    } catch (err) {
        console.error('Lỗi khi gửi email phản hồi liên hệ:', err);
        res.status(500).json({ message: 'Lỗi máy chủ khi phản hồi liên hệ!', error: err.message });
    }
};
