import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentResult.css';

const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="payment-result-page">
      <div className="payment-card failed">
        <div className="icon-circle">✕</div>
        <h2>THANH TOÁN KHÔNG THÀNH CÔNG</h2>
        <p className="subtitle">
          Giao dịch thanh toán qua cổng VNPay đã bị hủy hoặc gặp sự cố.
        </p>

        {bookingId && (
          <div className="booking-ref-box">
            <span>Mã đơn hủy:</span>
            <strong>#{bookingId.slice(-8).toUpperCase()}</strong>
          </div>
        )}

        <div className="info-note">
          Ghế của bạn đã được giải phóng. Bạn có thể chọn lại ghế và thử lại thanh toán.
        </div>

        <div className="actions-group">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Trở Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
