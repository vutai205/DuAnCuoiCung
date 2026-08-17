import { useState } from 'react';
import { Form, Input, Select, Button, message, Card } from 'antd';
import { 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  SendOutlined,
  CheckCircleFilled,
  QuestionCircleOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './ContactPage.css';

const { TextArea } = Input;
const { Option } = Select;

export default function ContactPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await axios.post('/api/contact', values);
      setSubmitted(true);
      message.success('Gửi thông tin liên hệ thành công! TNA Cinema sẽ phản hồi sớm nhất.');
      form.resetFields();
    } catch (err: any) {
      console.error('Lỗi khi gửi thông tin liên hệ:', err);
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  const faqItems = [
    {
      q: 'Tôi có thể hủy vé hoặc đổi suất chiếu sau khi đã thanh toán không?',
      a: 'Theo quy định của TNA Cinema, vé xem phim đã thanh toán thành công qua cổng thanh toán trực tuyến không hỗ trợ hủy hoàn tiền. Tuy nhiên, quý khách có thể liên hệ Hotline 1900 6868 trước giờ chiếu 60 phút để được hỗ trợ đổi sang suất chiếu khác cùng phim.'
    },
    {
      q: 'Làm thế nào để đăng ký chương trình Đặt Vé Nhóm / Thuê Rạp Doanh Nghiệp?',
      a: 'Quý khách vui lòng chọn chủ đề "Hợp tác & Đặt rạp nhóm" trong form liên hệ hoặc gọi trực tiếp Hotline 1900 6868 để nhận báo giá chiết khấu đặc biệt dành cho đoàn từ 20 người trở lên.'
    },
    {
      q: 'Quên thông tin tài khoản hoặc chưa nhận được vé điện tử?',
      a: 'Mã vé xem phim (QR Code) luôn được gửi tự động về Email đăng ký tài khoản và lưu tại mục "Thẻ Thành Viên / Lịch sử". Quý khách cũng có thể đọc Số điện thoại tại quầy vé để nhận vé cứng.'
    }
  ];

  return (
    <div className="contact-page-container">
      {/* Hero Header Section */}
      <div className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-content">
          <span className="contact-badge">
            <CustomerServiceOutlined /> TNA CINEMA SUPPORT
          </span>
          <h1 className="contact-title">Liên Hệ Với Chúng Tôi</h1>
          <p className="contact-subtitle">
            Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ giải đáp mọi thắc mắc của quý khách hàng 24/7.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="contact-main-wrapper">
        <div className="contact-grid">

          {/* Left Column: Direct Contact Info */}
          <div className="contact-info-section">
            <h2 className="section-title">
              <span className="accent-bar"></span> Thông Tin Liên Hệ Direct
            </h2>
            <p className="section-desc">
              Quý khách có thể liên hệ trực tiếp với cụm rạp TNA Cinema qua các kênh chăm sóc khách hàng bên dưới:
            </p>

            <div className="info-cards-list">
              <div className="info-card">
                <div className="info-icon-wrapper red">
                  <PhoneOutlined />
                </div>
                <div className="info-card-text">
                  <h3>Hotline CSKH (24/7)</h3>
                  <p className="highlight-text">1900 6868</p>
                  <span>Cước phí cuộc gọi: 1.000đ/phút</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon-wrapper gold">
                  <MailOutlined />
                </div>
                <div className="info-card-text">
                  <h3>Email Hỗ Trợ & Hợp Tác</h3>
                  <p className="highlight-text">support@tnacinema.com</p>
                  <span>Hợp tác truyền thông: media@tnacinema.com</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon-wrapper blue">
                  <EnvironmentOutlined />
                </div>
                <div className="info-card-text">
                  <h3>Trụ Sở Chính</h3>
                  <p className="highlight-text">Số 87 Láng Hạ, Đống Đa, Hà Nội</p>
                  <span>Tầng 5-6, Tòa nhà TNA Complex Center</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon-wrapper green">
                  <ClockCircleOutlined />
                </div>
                <div className="info-card-text">
                  <h3>Giờ Mở Cửa Phục Vụ</h3>
                  <p className="highlight-text">08:00 - 24:00</p>
                  <span>Hoạt động tất cả các ngày trong tuần (Kể cả Lễ, Tết)</span>
                </div>
              </div>
            </div>

            {/* Social Network Links - Blank links as requested */}
            <div className="contact-social-box">
              <h4>Theo dõi TNA Cinema trên MXH</h4>
              <div className="social-buttons">
                <a href="#" onClick={(e) => e.preventDefault()} className="social-btn fb">
                  📘 Facebook
                </a>
                <a href="#" onClick={(e) => e.preventDefault()} className="social-btn yt">
                  ▶️ YouTube
                </a>
                <a href="#" onClick={(e) => e.preventDefault()} className="social-btn zl">
                  💬 Zalo Official
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-section">
            <Card className="form-card-box">
              <h2 className="form-card-title">
                <SendOutlined /> Gửi Phản Hồi & Yêu Cầu Hỗ Trợ
              </h2>
              <p className="form-card-sub">
                Điền đầy đủ thông tin bên dưới, bộ phận CSKH sẽ phản hồi qua Email hoặc Số điện thoại trong vòng 24h.
              </p>

              {submitted ? (
                <div className="success-banner">
                  <CheckCircleFilled className="success-icon" />
                  <h3>Cảm ơn bạn đã gửi ý kiến phản hồi!</h3>
                  <p>Thông tin của bạn đã được chuyển tới Ban quản lý rạp TNA Cinema. Chúng tôi sẽ phản hồi sớm nhất.</p>
                  <Button type="primary" onClick={() => setSubmitted(false)} danger style={{ marginTop: 15 }}>
                    Gửi thêm yêu cầu khác
                  </Button>
                </div>
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  requiredMark="optional"
                  size="large"
                >
                  <div className="form-row-2col">
                    <Form.Item
                      name="fullname"
                      label={<span className="form-label">Họ và tên của bạn</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                      <Input placeholder="Ví dụ: Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item
                      name="phone"
                      label={<span className="form-label">Số điện thoại liên hệ</span>}
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ!' }
                      ]}
                    >
                      <Input placeholder="Ví dụ: 0987654321" />
                    </Form.Item>
                  </div>

                  <div className="form-row-2col">
                    <Form.Item
                      name="email"
                      label={<span className="form-label">Địa chỉ Email</span>}
                      rules={[
                        { required: true, message: 'Vui lòng nhập Email!' },
                        { type: 'email', message: 'Email không đúng định dạng!' }
                      ]}
                    >
                      <Input placeholder="name@example.com" />
                    </Form.Item>

                    <Form.Item
                      name="topic"
                      label={<span className="form-label">Vấn đề cần hỗ trợ</span>}
                      initialValue="ticket_support"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        <Option value="ticket_support">🎫 Hỗ trợ đặt vé / Thanh toán</Option>
                        <Option value="group_booking">🏢 Hợp tác / Đặt rạp theo đoàn</Option>
                        <Option value="feedback">💬 Phản ánh chất lượng dịch vụ</Option>
                        <Option value="lost_item">🔍 Thất lạc đồ tại rạp</Option>
                        <Option value="other">📌 Vấn đề khác</Option>
                      </Select>
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="message"
                    label={<span className="form-label">Nội dung yêu cầu / Góp ý</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi!' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Quý khách vui lòng mô tả chi tiết yêu cầu để TNA Cinema hỗ trợ nhanh nhất..."
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      danger
                      className="submit-contact-btn"
                    >
                      GỬI YÊU CẦU HỖ TRỢ
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Card>
          </div>

        </div>

        {/* Map & Location Section */}
        <div className="contact-map-section">
          <h2 className="section-title">
            <span className="accent-bar"></span> Vị Trí Cụm Rạp TNA Cinema Hà Nội
          </h2>
          <div className="map-container">
            <iframe
              title="TNA Cinema Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.3877995819777!2d105.81643431538965!3d21.01716039354898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab78d91f24d7%3A0xe21d42858b9f67a2!2s87%20P.%20L%C3%A1ng%20H%E1%BA%A1%2C%20Th%C3%A0nh%20C%C3%B4ng%2C%20%C4%90%E1%BB%91ng%20%C4%90a%2C%20H%C3%A0%20N%E1%BB%99i!5e0!3m2!1svi!2s!4v1680000000000!5m2!1svi!2s"
              width="100%"
              height="380"
              style={{ border: 0, borderRadius: '16px' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Quick FAQ Accordion / Cards Section */}
        <div className="contact-faq-section">
          <h2 className="section-title">
            <span className="accent-bar"></span> <QuestionCircleOutlined /> Câu Hỏi Thường Gặp (FAQ)
          </h2>
          <div className="faq-grid">
            {faqItems.map((item, idx) => (
              <div key={idx} className="faq-card">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
