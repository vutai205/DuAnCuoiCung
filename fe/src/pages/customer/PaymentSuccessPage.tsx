import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCode } from 'antd';
import './PaymentResult.css';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="payment-result-page">
      <div className="payment-card success">
        <div className="icon-circle">✓</div>
        <h2>THANH TOÁN VNPAY THÀNH CÔNG!</h2>
        <p className="subtitle">
          Cảm ơn bạn đã hoàn tất thanh toán online qua cổng VNPay Gateway.
        </p>

        {bookingId && (
          <div className="booking-ref-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1.5rem 0' }}>
            <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', marginBottom: '10px' }}>
              <QRCode value={bookingId} size={150} color="#000" bgColor="#fff" />
            </div>
            <span>MÃ VÉ ĐIỆN TỬ:</span>
            <strong style={{ fontSize: '1.2rem', color: '#e50914' }}>#{bookingId.toUpperCase()}</strong>
          </div>
        )}

        <div className="info-note">
           Vé điện tử của bạn đã được xác nhận. Vui lòng xuất trình mã QR trên cho nhân viên soát vé tại rạp để in vé vào xem phim.
        </div>

        <div className="actions-group">
          <button className="btn-secondary" onClick={() => navigate('/profile')}>
            Xem Lịch Sử Mua Vé
          </button>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Trở Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
