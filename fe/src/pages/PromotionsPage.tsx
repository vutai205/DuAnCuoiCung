import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActivePromos } from '../services/promoApi';
import type { PromoCode } from '../types/promo';
import '../styles/promotions.css';

function formatDiscount(promo: PromoCode) {
  if (promo.discountType === 'percent') {
    return `-${promo.discountValue}%`;
  }
  return `-${promo.discountValue.toLocaleString('vi-VN')}đ`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN');
}

export default function PromotionsPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPromos = async () => {
      setLoading(true);
      try {
        const data = await getActivePromos();
        setPromos(data);
      } catch {
        setError('Không tải được danh sách khuyến mại.');
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  return (
    <div className="promotions-page">
      <div className="promotions-container">
        <h1>Mã giảm giá & Khuyến mại</h1>
        <p className="promotions-desc">
          Sao chép mã bên dưới và nhập khi thanh toán đặt vé để nhận ưu đãi.
        </p>

        {loading && <p className="promotions-loading">Đang tải...</p>}
        {error && <div className="promotions-alert">{error}</div>}

        {!loading && !error && promos.length === 0 && (
          <p className="promotions-empty">Hiện chưa có mã khuyến mại nào.</p>
        )}

        <div className="promo-grid">
          {promos.map((promo) => (
            <div key={promo._id} className="promo-card">
              <div className="promo-card__badge">{formatDiscount(promo)}</div>
              <h3>{promo.title}</h3>
              <p className="promo-card__desc">{promo.description}</p>
              <div className="promo-card__code">
                <span>{promo.code}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(promo.code)}
                >
                  Sao chép
                </button>
              </div>
              <ul className="promo-card__meta">
                {promo.minOrder > 0 && (
                  <li>Đơn tối thiểu: {promo.minOrder.toLocaleString('vi-VN')}đ</li>
                )}
                <li>HSD: {formatDate(promo.expiresAt)}</li>
                {promo.maxUses !== null && (
                  <li>Còn {Math.max(0, promo.maxUses - promo.usedCount)} lượt</li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="promotions-footer">
          <Link to="/movies" className="promotions-link">
            ← Xem phim và đặt vé
          </Link>
        </div>
      </div>
    </div>
  );
}
