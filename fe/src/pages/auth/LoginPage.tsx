import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/auth/AuthLayout';
import { login, saveAuthUser } from '../../services/authApi';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    const emailTrimmed = email.trim();

    if (!emailTrimmed) {
      errors.email = 'Vui lòng nhập địa chỉ Email của bạn!';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Email không hợp lệ (VD: ban@email.com)!';
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu!';
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự!';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const user = await login({ email: email.trim(), password });
      saveAuthUser(user);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      } else {
        setError('Đã xảy ra lỗi hệ thống. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Đăng nhập để đặt vé xem phim yêu thích."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="auth-alert auth-alert--error">⚠️ {error}</div>}

        <div className="auth-field">
          <label htmlFor="email">EMAIL</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">✉️</span>
            <input
              id="email"
              type="email"
              placeholder="ban@email.com"
              value={email}
              className={fieldErrors.email ? 'has-error' : ''}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
              }}
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && <div className="auth-field-error">⚠️ {fieldErrors.email}</div>}
        </div>

        <div className="auth-field">
          <label htmlFor="password">MẬT KHẨU</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">🔒</span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              className={fieldErrors.password ? 'has-error' : ''}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
              }}
              autoComplete="current-password"
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
          {fieldErrors.password && <div className="auth-field-error">⚠️ {fieldErrors.password}</div>}
        </div>

        <div className="auth-form__actions">
          <Link to="/forgot-password" className="auth-link">
            Quên mật khẩu?
          </Link>
        </div>

        <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
          {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p className="auth-switch">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="auth-link auth-link--bold">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
