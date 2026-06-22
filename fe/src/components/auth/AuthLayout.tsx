import { Link } from 'react-router-dom';
import '../../styles/auth.css';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__overlay" />
        <div className="auth-bg__film-strip auth-bg__film-strip--left" />
        <div className="auth-bg__film-strip auth-bg__film-strip--right" />
      </div>

      <div className="auth-container">
        <Link to="/login" className="auth-brand">
          <span className="auth-brand__icon">🎬</span>
          <div>
            <span className="auth-brand__name">CineTicket</span>
            <span className="auth-brand__tagline">Đặt vé xem phim online</span>
          </div>
        </Link>

        <div className="auth-card">
          <div className="auth-card__header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>

        <p className="auth-footer">
          © 2026 CineTicket — Trải nghiệm điện ảnh tuyệt vời
        </p>
      </div>
    </div>
  );
}
