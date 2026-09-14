import { useState, useEffect } from 'react';
import { Button, message, Tag, Progress, Spin, Alert } from 'antd';
import { GiftOutlined, TagOutlined, CheckCircleOutlined, FireOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../services/authApi';
import './PromotionsPage.css';

interface Voucher {
  _id: string;
  code: string;
  description: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export default function PromotionsPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [savedVoucherIds, setSavedVoucherIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const navigate = useNavigate();
  const user = getAuthUser();

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch public active vouchers
      const publicRes = await axios.get('/api/vouchers/public');
      setVouchers(publicRes.data || []);

      // 2. Fetch user's saved vouchers if logged in
      if (user) {
        try {
          const myRes = await axios.get('/api/vouchers/my-vouchers', getHeaders());
          if (Array.isArray(myRes.data)) {
            setSavedVoucherIds(myRes.data.map((v: any) => v._id));
          }
        } catch (e) {
          console.error('Lỗi khi tải ví voucher cá nhân:', e);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách khuyến mãi:', err);
      message.error('Không thể tải danh sách khuyến mãi. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveVoucher = async (voucherId: string, code: string) => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để lưu mã ưu đãi vào Ví của bạn!');
      navigate('/login');
      return;
    }

    setSavingId(voucherId);
    try {
      const res = await axios.post('/api/vouchers/save', { voucherId }, getHeaders());
      message.success(res.data.message || `Đã lưu mã ${code} vào Ví ưu đãi thành công!`);
      setSavedVoucherIds((prev) => [...prev, voucherId]);
    } catch (err: any) {
      console.error('Lỗi khi lưu voucher:', err);
      message.error(err.response?.data?.message || 'Không thể lưu voucher này!');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="promotions-page-container">
      {/* Hero Header */}
      <div className="promotions-hero">
        <div className="promotions-hero-overlay"></div>
        <div className="promotions-hero-content">
          <span className="promotions-badge">
            <GiftOutlined /> ƯU ĐÃI ĐỘC QUYỀN TNA CINEMA
          </span>
          <h1 className="promotions-title">Khuyến Mãi & Ví Voucher</h1>
          <p className="promotions-subtitle">
            Nhận mã giảm giá độc quyền hàng tuần. Lưu ngay vào Ví để tự động áp dụng khi đặt vé xem phim trực tuyến!
          </p>
        </div>
      </div>

      <div className="promotions-main-wrapper">

        {/* Highlight Banner: Monday Event */}
        <div className="monday-event-banner">
          <div className="banner-left">
            <Tag color="red" className="fire-tag"><FireOutlined /> HOT EVENT HÀNG TUẦN</Tag>
            <h2>🎉 THỨ 2 VUI VẺ - PHÁT 100 VOUCHER GIẢM 10.000Đ</h2>
            <p>
              Mỗi ngày <strong>Thứ 2 hàng tuần</strong>, hệ thống TNA Cinema phát tự động <strong>100 mã Voucher giảm 10.000đ</strong> trực tiếp cho tất cả khách hàng. Nhanh tay bấm <strong>"Lưu Voucher"</strong> để không bỏ lỡ suất chiếu giá rẻ!
            </p>
          </div>
          <div className="banner-right">
            <div className="badge-discount-circle">
              <span>GIẢM</span>
              <strong>10K</strong>
            </div>
          </div>
        </div>

        {/* User Status Notice */}
        {!user && (
          <Alert
            message="Bạn chưa đăng nhập"
            description="Hãy đăng nhập tài khoản TNA Cinema để lưu các mã giảm giá vào Ví cá nhân và áp dụng tự động khi đặt vé xem phim."
            type="info"
            showIcon
            action={
              <Button type="primary" danger size="small" onClick={() => navigate('/login')}>
                Đăng nhập ngay
              </Button>
            }
            style={{ marginBottom: 25, borderRadius: 8 }}
          />
        )}

        {/* Main List of Vouchers */}
        <div className="section-header">
          <h2><TagOutlined /> Danh Sách Mã Ưu Đãi Đang Phát Hành</h2>
          <p>Bấm nút "Lưu Voucher" để lưu mã vào tài khoản của bạn</p>
        </div>

        {loading ? (
          <div className="loading-box">
            <Spin size="large" tip="Đang tải danh sách khuyến mãi..." />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="empty-vouchers">
            <p>Hiện chưa có chương trình khuyến mãi nào đang phát hành. Vui lòng quay lại sau!</p>
          </div>
        ) : (
          <div className="vouchers-grid">
            {vouchers.map((v) => {
              const isSaved = savedVoucherIds.includes(v._id);
              const remaining = Math.max(0, v.usageLimit - v.usedCount);
              const usedPercent = Math.min(100, Math.round((v.usedCount / v.usageLimit) * 100));

              return (
                <div key={v._id} className={`voucher-card ${isSaved ? 'saved' : ''}`}>
                  <div className="voucher-card-left">
                    <div className="voucher-tag-badge">
                      {v.discountType === 'fixed'
                        ? `GIẢM ${v.discountValue.toLocaleString('vi-VN')}đ`
                        : `GIẢM ${v.discountValue}%`}
                    </div>
                    <div className="voucher-code-display">{v.code}</div>
                  </div>

                  <div className="voucher-card-right">
                    <h3 className="voucher-title">{v.description || `Mã giảm giá ${v.code}`}</h3>

                    <div className="voucher-details">
                      <div>• Đơn tối thiểu: <strong>{v.minOrderValue > 0 ? `${v.minOrderValue.toLocaleString('vi-VN')} đ` : '0 đ'}</strong></div>
                      {v.expiresAt && (
                        <div>• Hạn dùng: <strong>{new Date(v.expiresAt).toLocaleDateString('vi-VN')}</strong></div>
                      )}
                    </div>

                    <div className="usage-progress-box">
                      <div className="progress-info">
                        <span>Đã lưu/dùng: {v.usedCount}/{v.usageLimit} mã</span>
                        <span>(Còn {remaining} mã)</span>
                      </div>
                      <Progress percent={usedPercent} size="small" status="active" strokeColor="#e50914" />
                    </div>

                    <div className="voucher-action-footer">
                      {isSaved ? (
                        <Button className="saved-btn" icon={<CheckCircleOutlined />} disabled>
                          Đã Lưu Vào Ví
                        </Button>
                      ) : user ? (
                        <Button
                          type="primary"
                          danger
                          className="save-btn"
                          loading={savingId === v._id}
                          onClick={() => handleSaveVoucher(v._id, v.code)}
                        >
                          📌 Lưu Voucher
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          ghost
                          danger
                          icon={<LockOutlined />}
                          onClick={() => {
                            message.info('Vui lòng đăng nhập để lưu mã ưu đãi!');
                            navigate('/login');
                          }}
                        >
                          Đăng Nhập Để Lưu
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
