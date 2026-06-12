import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/auth/AuthLayout';
import { register, saveAuthUser } from '../../services/authApi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const user = await register({ name, email, password });
      saveAuthUser(user);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng ký"
      subtitle="Tạo tài khoản miễn phí để đặt vé và nhận ưu đãi độc quyền."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-alert auth-alert--error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="name">Họ và tên</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">👤</span>
            <input
              id="name"
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
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

        <div className="auth-field">
          <label htmlFor="password">Mật khẩu</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">🔒</span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">🔐</span>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
        </button>

        <p className="auth-switch">
          Đã có tài khoản?{' '}
          <Link to="/login" className="auth-link auth-link--bold">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
