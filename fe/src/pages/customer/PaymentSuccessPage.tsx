import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
          Cảm ơn bạn đã hoàn tất thanh toán online qua cổng VNPay Sandbox.
        </p>

        {bookingId && (
          <div className="booking-ref-box">
            <span>Mã đơn đặt vé:</span>
            <strong>#{bookingId.slice(-8).toUpperCase()}</strong>
          </div>
        )}

        <div className="info-note">
           Vé điện tử của bạn đã được xác nhận. Vui lòng kiểm tra trong lịch sử mua vé để lấy mã QR/Barcode khi tới rạp.
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
