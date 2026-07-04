import { Routes, Route, Link } from "react-router-dom";
import MoviesPage from "./pages/MoviesPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

function Home() {
  return (
    <div>
      <h1>CineTicket</h1>

      <nav style={{ display: "flex", gap: "10px" }}>
        <Link to="/movies">Xem phim</Link>
        <Link to="/login">Đăng nhập</Link>
        <Link to="/register">Đăng ký</Link>
        <Link to="/forgot-password">Quên mật khẩu</Link>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
  );
}