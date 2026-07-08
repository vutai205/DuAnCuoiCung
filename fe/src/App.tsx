import { Routes, Route, Link, Navigate } from 'react-router-dom';
import MoviesPage from './pages/MoviesPage';
import BookingPage from './pages/BookingPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import { getAuthUser, logout } from './services/authApi';
import './App.css';

function Navbar() {
  const user = getAuthUser();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        🎬 CineTicket
      </Link>
      <div className="navbar__links">
        <Link to="/movies">Phim đang chiếu</Link>
        {user ? (
          <>
            <span className="navbar__user">Xin chào, {user.name}</span>
            <button type="button" className="navbar__logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register" className="navbar__register">Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Home() {
  const user = getAuthUser();

  return (
    <div className="home-page">
      <h1>Chào mừng đến CineTicket</h1>
      <p>Đặt vé xem phim nhanh chóng — chọn rạp, suất chiếu và ghế yêu thích.</p>
      <div className="home-page__actions">
        <Link to="/movies" className="home-btn home-btn--primary">
          Xem phim đang chiếu
        </Link>
        {!user && (
          <Link to="/login" className="home-btn home-btn--outline">
            Đăng nhập để đặt vé
          </Link>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/booking/:movieId"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/seats/:showtimeId"
          element={
            <ProtectedRoute>
              <SeatSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
