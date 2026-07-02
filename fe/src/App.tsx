import { Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import { getAuthUser } from './services/authApi';
import './App.css';
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";

function HomePage() {
  const user = getAuthUser();

  return (
    <div className="home-page">
      <h1> CineTicket</h1>
      <p>Chào mừng{user ? `, ${user.name}` : ''}! Trang chủ rạp chiếu phim.</p>
      {!user && (
        <div className="home-page__links">
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register">Đăng ký</Link>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />

    </Routes>
  );
}

export default App;
