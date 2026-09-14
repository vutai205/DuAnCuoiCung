import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/auth/AuthLayout';
import { register, saveAuthUser } from '../../services/authApi';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    const nameTrimmed = name.trim();
    if (!nameTrimmed) {
      errors.name = 'Vui lòng nhập họ và tên của bạn!';
    } else if (nameTrimmed.length < 2) {
      errors.name = 'Họ và tên phải dài ít nhất 2 ký tự!';
    }

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      errors.email = 'Vui lòng nhập địa chỉ Email!';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Email không đúng định dạng (VD: ban@email.com)!';
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu!';
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu!';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp!';
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
      const user = await register({ name: name.trim(), email: email.trim(), password });
      saveAuthUser(user);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      } else {
        setError('Đã xảy ra lỗi hệ thống. Vui lòng thử lại.');
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
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="auth-alert auth-alert--error">⚠️ {error}</div>}

        <div className="auth-field">
          <label htmlFor="name">HỌ VÀ TÊN</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">👤</span>
            <input
              id="name"
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              className={fieldErrors.name ? 'has-error' : ''}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
              }}
              autoComplete="name"
            />
          </div>
          {fieldErrors.name && <div className="auth-field-error">⚠️ {fieldErrors.name}</div>}
        </div>

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
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              className={fieldErrors.password ? 'has-error' : ''}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
              }}
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
          {fieldErrors.password && <div className="auth-field-error">⚠️ {fieldErrors.password}</div>}
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword">XÁC NHẬN MẬT KHẨU</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">🔐</span>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              className={fieldErrors.confirmPassword ? 'has-error' : ''}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
              autoComplete="new-password"
            />
          </div>
          {fieldErrors.confirmPassword && <div className="auth-field-error">⚠️ {fieldErrors.confirmPassword}</div>}
        </div>

        <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
          {loading ? '⏳ Đang tạo tài khoản...' : 'Tạo tài khoản'}
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
