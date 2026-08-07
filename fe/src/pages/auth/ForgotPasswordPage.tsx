import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/auth/AuthLayout';
import { forgotPassword, resetPassword } from '../../services/authApi';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await forgotPassword({ email });
      setSuccess(data.message || 'Mã OTP đã được gửi về email của bạn.');
      setStep(2);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword({ email, otp, newPassword });
      setSuccess(data.message || 'Đặt lại mật khẩu thành công! Đang chuyển hướng sang Đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
      } else {
        setError('Đã xảy ra lỗi khi đặt lại mật khẩu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle={
        step === 1
          ? 'Bước 1/2: Nhập email đã đăng ký để nhận mã xác minh OTP 6 chữ số.'
          : `Bước 2/2: Nhập mã OTP đã gửi tới email [${email}] và tạo mật khẩu mới.`
      }
    >
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      {success && <div className="auth-alert auth-alert--success">{success}</div>}

      {step === 1 ? (
        <form className="auth-form" onSubmit={handleSendOtp}>
          <div className="auth-field">
            <label htmlFor="email">EMAIL ĐÃ ĐĂNG KÝ</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉️</span>
              <input
                id="email"
                type="email"
                placeholder="ban@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
            {loading ? '⏳ Đang gửi mã OTP...' : '📩 Gửi Mã OTP Xác Minh'}
          </button>

          <p className="auth-switch">
            <Link to="/login" className="auth-link auth-link--bold">
              ← Quay lại đăng nhập
            </Link>
          </p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleResetPassword}>
          <div className="auth-field">
            <label htmlFor="otp">MÃ XÁC MINH OTP (6 CHỮ SỐ)</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔑</span>
              <input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="VD: 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{ letterSpacing: '4px', fontWeight: 'bold', fontSize: '1.1rem' }}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="newPassword">MẬT KHẨU MỚI</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="newPassword"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">NHẬP LẠI MẬT KHẨU MỚI</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🛡️</span>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Xác nhận lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
            {loading ? '⏳ Đang lưu mật khẩu...' : '✅ Xác Nhận Đặt Lại Mật Khẩu'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 15, fontSize: '0.9rem' }}>
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              ← Gửi lại OTP / Đổi Email
            </button>
            <Link to="/login" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 'bold' }}>
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
