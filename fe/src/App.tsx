import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import { getAuthUser } from './services/authApi';
import './App.css';

// Admin components from local HEAD layout/pages
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";

// Customer components from remote kiem-thu branch
import Header from "./app/components/Header/Header";
import Footer from "./app/components/Footer/Footer";
import Profile from "./app/pages/Profile/Profile";
import MemberCard from "./app/pages/Profile/MemberCard";

// Admin components from remote kiem-thu branch
import FoodList from "./app/pages/admin/Food/FoodList";
import CustomerList from "./app/pages/admin/Customer/CustomerList";
import BookingList from "./app/pages/admin/Booking/BookingList";

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
  const location = useLocation();
  
  // Do not show user-facing Header/Footer on admin pages and auth pages
  const showHeaderFooter = !location.pathname.startsWith('/admin') && !['/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <>
      {showHeaderFooter && <Header />}

      <Routes>
        {/* User routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/member-card" element={<MemberCard />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="foods" element={<FoodList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="bookings" element={<BookingList />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {showHeaderFooter && <Footer />}
    </>
  );
}

export default App;
