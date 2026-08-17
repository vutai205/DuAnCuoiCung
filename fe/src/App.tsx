import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import { getAuthUser } from './services/authApi';
import './App.css';

// Guard component to redirect staff users accessing admin-only routes
function AdminOnlyRoute({ children }: { children: JSX.Element }) {
  const user = getAuthUser();
  if (user?.role === 'staff') {
    return <Navigate to="/admin/bookings" replace />;
  }
  return children;
}

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
import VoucherManager from "./pages/admin/VoucherManager";
import ReviewManager from "./pages/admin/ReviewManager";
import ContactManager from "./pages/admin/ContactManager";

// Customer components
import Header from "./app/components/Header/Header";
import Footer from "./app/components/Footer/Footer";
import Profile from "./app/pages/Profile/Profile";
import MemberCard from "./app/pages/Profile/MemberCard";
import BannerSlider from "./app/components/BannerSlider/BannerSlider";
import MovieDetailPage from "./pages/customer/MovieDetailPage";
import BookingPage from "./pages/customer/BookingPage";
import ContactPage from "./pages/customer/ContactPage";
import PaymentSuccessPage from "./pages/customer/PaymentSuccessPage";
import PaymentFailedPage from "./pages/customer/PaymentFailedPage";

// Helper component to scroll to top automatically on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function HomePage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'showing' | 'upcoming'>('showing');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

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

  // Trích xuất tự động tất cả thể loại thực tế có trong danh sách phim
  const availableGenres = Array.from(
    new Set(
      movies.flatMap((m) => {
        const list: string[] = [];
        if (m.genre) {
          m.genre.split(/[\/,;]+/).forEach((g: string) => {
            const trimmed = g.trim();
            if (trimmed) list.push(trimmed);
          });
        }
        if (Array.isArray(m.genres)) {
          m.genres.forEach((g: string) => {
            const trimmed = typeof g === 'string' ? g.trim() : '';
            if (trimmed) list.push(trimmed);
          });
        }
        return list;
      })
    )
  ).sort();

  const filteredMovies = movies.filter((movie) => {
    // Lọc theo Tab (Đang chiếu / Sắp chiếu)
    if (activeTab === 'showing') {
      if (movie.status && movie.status !== 'now_showing') return false;
    } else {
      if (movie.status !== 'coming_soon') return false;
    }

    // Lọc theo Từ khóa tìm kiếm
    if (searchTerm.trim()) {
      if (!movie.title.toLowerCase().includes(searchTerm.toLowerCase().trim())) {
        return false;
      }
    }

    // Lọc theo Thể loại
    if (selectedGenre !== 'all') {
      const selectedLower = selectedGenre.toLowerCase().trim();
      const movieGenreStr = (movie.genre || '').toLowerCase();
      const movieGenresArr = Array.isArray(movie.genres)
        ? movie.genres.map((g: string) => (typeof g === 'string' ? g.toLowerCase().trim() : ''))
        : [];

      const isMatchInString = movieGenreStr.includes(selectedLower);
      const isMatchInArray = movieGenresArr.some((g: string) => g.includes(selectedLower));

      if (!isMatchInString && !isMatchInArray) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="home-page-container">
      {/* Banner Slider */}
      <BannerSlider />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Navigation Tabs & Filter Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
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

          {/* Search & Genre Filter */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '10px' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm phim theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: '#1f2937',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: '#1f2937',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">🎬 Tất Cả Thể Loại</option>
              {availableGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Movies Grid Section */}
        <div className="movies-section">
          {loading ? (
            <div className="loading-spinner-box">
              <div className="spinner"></div>
              <span>Đang tải danh sách phim...</span>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="no-movies-box" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#111827', borderRadius: '12px', color: '#9ca3af' }}>
              Không tìm thấy phim nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="movie-grid">
              {filteredMovies.map((movie) => (
                <div className="movie-card" key={movie._id}>
                  <Link to={`/movie/${movie._id}`} className="poster-container-link">
                    <div className="poster-container">
                      <img 
                        src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'} 
                        alt={movie.title} 
                        className="movie-poster" 
                      />
                      <span className="duration-tag">{movie.duration} phút</span>
                      {movie.format && (
                        <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#e50914', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          {movie.format}
                        </span>
                      )}
                      <div className="poster-overlay">
                        <span className="btn-overlay-book">
                          MUA VÉ NGAY
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="movie-info">
                    <span className="movie-genre">{movie.genre || (movie.genres ? movie.genres.join(', ') : '')}</span>
                    <Link to={`/movie/${movie._id}`} className="movie-title-link">
                      <h3 className="movie-title">{movie.title}</h3>
                    </Link>
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
      <ScrollToTop />
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
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<AdminOnlyRoute><MovieList /></AdminOnlyRoute>} />
          <Route path="movies/add" element={<AdminOnlyRoute><MovieAdd /></AdminOnlyRoute>} />
          <Route path="movies/edit/:id" element={<AdminOnlyRoute><MovieEdit /></AdminOnlyRoute>} />
          <Route path="banner" element={<AdminOnlyRoute><Banner /></AdminOnlyRoute>} />
          <Route path="rooms" element={<AdminOnlyRoute><Rooms /></AdminOnlyRoute>} />
          <Route path="showtimes" element={<AdminOnlyRoute><Showtimes /></AdminOnlyRoute>} />
          <Route path="users" element={<AdminOnlyRoute><UserManager /></AdminOnlyRoute>} />
          <Route path="foods" element={<AdminOnlyRoute><FoodList /></AdminOnlyRoute>} />
          <Route path="vouchers" element={<AdminOnlyRoute><VoucherManager /></AdminOnlyRoute>} />
          <Route path="reviews" element={<AdminOnlyRoute><ReviewManager /></AdminOnlyRoute>} />
          <Route path="contacts" element={<AdminOnlyRoute><ContactManager /></AdminOnlyRoute>} />
          <Route path="customers" element={<AdminOnlyRoute><CustomerList /></AdminOnlyRoute>} />
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
