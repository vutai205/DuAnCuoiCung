import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import './App.css';

// Admin components
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import MovieList from "./pages/admin/movie/MovieList";
import MovieAdd from "./pages/admin/movie/MovieAdd";
import MovieEdit from "./pages/admin/movie/MovieEdit";
// @ts-ignore
import UserManager from "./pages/admin/UserManager";
import Banner from "./pages/admin/Banner";
import Rooms from "./pages/admin/Rooms";
import Showtimes from "./pages/admin/Showtimes";
import FoodList from "./app/pages/admin/Food/FoodList";
import CustomerList from "./app/pages/admin/Customer/CustomerList";
import BookingList from "./app/pages/admin/Booking/BookingList";

// Customer components
import Header from "./app/components/Header/Header";
import Footer from "./app/components/Footer/Footer";
import Profile from "./app/pages/Profile/Profile";
import MemberCard from "./app/pages/Profile/MemberCard";
import BannerSlider from "./app/components/BannerSlider/BannerSlider";
import MovieDetailPage from "./pages/customer/MovieDetailPage";
import BookingPage from "./pages/customer/BookingPage";
import PaymentSuccessPage from "./pages/customer/PaymentSuccessPage";
import PaymentFailedPage from "./pages/customer/PaymentFailedPage";

function HomePage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'showing' | 'upcoming'>('showing');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get('/api/movies');
        setMovies(res.data);
      } catch (err) {
        console.error('Lỗi khi tải phim:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const filteredMovies = activeTab === 'showing' 
    ? movies 
    : movies.slice().reverse();

  return (
    <div className="home-page-container">
      {/* Banner Slider */}
      <BannerSlider />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Navigation Tabs */}
        <div className="movie-tabs-container">
          <button
            className={`tab-btn ${activeTab === 'showing' ? 'active' : ''}`}
            onClick={() => setActiveTab('showing')}
          >
            🔥 PHIM ĐANG CHIẾU
          </button>
          <button
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            ⏳ PHIM SẮP CHIẾU
          </button>
        </div>

        {/* Movies Grid Section */}
        <div className="movies-section">
          {loading ? (
            <div className="loading-spinner-box">
              <div className="spinner"></div>
              <span>Đang tải danh sách phim...</span>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="no-movies-box">Hiện tại chưa có phim nào trong mục này.</div>
          ) : (
            <div className="movie-grid">
              {filteredMovies.map((movie) => (
                <div className="movie-card" key={movie._id}>
                  <div className="poster-container">
                    <img 
                      src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'} 
                      alt={movie.title} 
                      className="movie-poster" 
                    />
                    <span className="duration-tag">{movie.duration} phút</span>
                    <div className="poster-overlay">
                      <Link to={`/movie/${movie._id}`} className="btn-overlay-book">
                        MUA VÉ NGAY
                      </Link>
                    </div>
                  </div>
                  <div className="movie-info">
                    <span className="movie-genre">{movie.genre}</span>
                    <h3 className="movie-title">{movie.title}</h3>
                    <p className="movie-desc">{movie.description}</p>
                    <div className="card-action-bar">
                      <Link to={`/movie/${movie._id}`} className="book-btn">
                        Chi Tiết & Đặt Vé
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
        {/* Customer routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/booking/:showtimeId" element={<BookingPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/member-card" element={<MemberCard />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-failed" element={<PaymentFailedPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<MovieList />} />
          <Route path="movies/add" element={<MovieAdd />} />
          <Route path="movies/edit/:id" element={<MovieEdit />} />
          <Route path="banner" element={<Banner />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="showtimes" element={<Showtimes />} />
          <Route path="users" element={<UserManager />} />
          <Route path="foods" element={<FoodList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="bookings" element={<BookingList />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showHeaderFooter && <Footer />}
    </>
  );
}

export default App;
