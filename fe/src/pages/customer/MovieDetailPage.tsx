import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { message } from 'antd';
import { getAuthUser, getToken } from '../../services/authApi';
import './MovieDetailPage.css';

dayjs.locale('vi');

interface Movie {
  _id: string;
  title: string;
  description: string;
  duration: number;
  poster: string;
  genre: string;
  releaseDate: string;
  ageRating?: string;
  director?: string;
  cast?: string;
}

interface ShowtimeGroup {
  date: string;
  showtimes: {
    _id: string;
    startTime: string;
    endTime: string;
    ticketPrice: number;
    room: { _id: string; name: string };
  }[];
}

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimeGroups, setShowtimeGroups] = useState<ShowtimeGroup[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showTrailerModal, setShowTrailerModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [movieRes, showtimesRes] = await Promise.all([
          axios.get(`/api/movies/${id}`),
          axios.get(`/api/showtimes/movie/${id}`)
        ]);

        setMovie(movieRes.data);
        const groups: ShowtimeGroup[] = showtimesRes.data;
        setShowtimeGroups(groups);

        if (groups.length > 0) {
          setSelectedDate(groups[0].date);
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết phim:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMovieData();
  }, [id]);

  if (loading) {
    return (
      <div className="movie-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin phim...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-detail-error">
        <h2>Không tìm thấy bộ phim này!</h2>
        <Link to="/" className="btn-back">Về trang chủ</Link>
      </div>
    );
  }

  const currentDayGroup = showtimeGroups.find(g => g.date === selectedDate);

  const getAgeRatingBadge = (title: string) => {
    if (title.includes('18') || title.includes('Dune')) return { code: 'T18', text: 'Phim dành cho khán giả từ đủ 18 tuổi trở lên', color: '#e50914' };
    if (title.includes('7') || title.includes('Lật Mặt')) return { code: 'T16', text: 'Phim dành cho khán giả từ đủ 16 tuổi trở lên', color: '#ff9800' };
    return { code: 'P', text: 'Phim được phép phổ biến đến mọi đối tượng', color: '#4caf50' };
  };

  const ageBadge = getAgeRatingBadge(movie.title);

  return (
    <div className="movie-detail-container">
      {/* Top Backdrop Banner */}
      <div className="movie-backdrop" style={{ backgroundImage: `url(${movie.poster})` }}>
        <div className="backdrop-overlay"></div>
      </div>

      <div className="movie-detail-content">
        <div className="movie-header-section">
          <div className="movie-poster-box">
            <img src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'} alt={movie.title} />
            <button className="btn-play-trailer" onClick={() => setShowTrailerModal(true)}>
              ▶ Xem Trailer
            </button>
          </div>

          <div className="movie-info-box">
            <div className="age-rating-tag" style={{ backgroundColor: ageBadge.color }}>
              {ageBadge.code}
            </div>
            <h1 className="movie-main-title">{movie.title}</h1>
            <p className="age-rating-subtext">{ageBadge.text}</p>

            <div className="movie-meta-grid">
              <div className="meta-item">
                <span className="meta-label">Thể loại:</span>
                <span className="meta-value">{movie.genre}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Thời lượng:</span>
                <span className="meta-value">{movie.duration} phút</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Khởi chiếu:</span>
                <span className="meta-value">{dayjs(movie.releaseDate).format('DD/MM/YYYY')}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Ngôn ngữ:</span>
                <span className="meta-value">Tiếng Việt - Phụ đề Tiếng Anh</span>
              </div>
            </div>

            <div className="movie-synopsis">
              <h3>Nội dung phim</h3>
              <p>{movie.description}</p>
            </div>
          </div>
        </div>

        {/* Showtime Section */}
        <div className="showtime-booking-section">
          <h2 className="section-heading">LỊCH CHIẾU & ĐẶT VÉ</h2>

          {showtimeGroups.length === 0 ? (
            <div className="no-showtimes-box">
              <p>Hiện chưa có suất chiếu nào được lên lịch cho bộ phim này.</p>
            </div>
          ) : (
            <>
              {/* Date Tabs */}
              <div className="date-tabs-bar">
                {showtimeGroups.map((group) => {
                  const d = dayjs(group.date);
                  const isSelected = group.date === selectedDate;
                  return (
                    <button
                      key={group.date}
                      className={`date-tab-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedDate(group.date)}
                    >
                      <span className="date-tab-day">{d.format('DD/MM')}</span>
                      <span className="date-tab-name">{d.format('dddd')}</span>
                    </button>
                  );
                })}
              </div>

              {/* Showtimes Grid */}
              <div className="showtimes-list-container">
                {currentDayGroup && currentDayGroup.showtimes.length > 0 ? (
                  <div className="showtimes-room-group">
                    <div className="room-badge-title">TNA CINEMA - HÀ NỘI</div>
                    <div className="showtime-pills-grid">
                      {currentDayGroup.showtimes
                        .filter((st) => st && st.room)
                        .map((st) => (
                          <div
                            key={st._id}
                            className="showtime-pill-card"
                            onClick={() => {
                              const currentUser = getAuthUser();
                              if (currentUser && currentUser.role === 'admin') {
                                message.error('🚫 Tài khoản Quản trị viên (Admin) không được phép thực hiện mua vé! Vui lòng dùng tài khoản Khách hàng.');
                                return;
                              }
                              navigate(`/booking/${st._id}`);
                            }}
                          >
                            <span className="st-time">{dayjs(st.startTime).format('HH:mm')}</span>
                            <span className="st-room">{st.room?.name || 'Phòng chiếu'}</span>
                            <span className="st-price">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(st.ticketPrice)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-showtimes-box">
                    <p>Không có suất chiếu nào trong ngày đã chọn.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Movie Review Section */}
        <MovieReviewSection movieId={id || ''} />
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && (
        <div className="trailer-modal-backdrop" onClick={() => setShowTrailerModal(false)}>
          <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setShowTrailerModal(false)}>✕</button>
            <div className="video-responsive">
              <iframe
                width="854"
                height="480"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component Đánh Giá Phim
const MovieReviewSection: React.FC<{ movieId: string }> = ({ movieId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const currentUser = typeof window !== 'undefined' ? (getAuthUser() || JSON.parse(localStorage.getItem('user_info') || 'null')) : null;

  const fetchReviews = async () => {
    if (!movieId) return;
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`/api/reviews/movie/${movieId}`, { headers });

      setReviews(res.data.reviews || []);
      setAverageRating(res.data.averageRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
      setHasPurchased(!!res.data.hasPurchased);
      setHasReviewed(!!res.data.hasReviewed);
    } catch (err) {
      console.error('Lỗi khi tải đánh giá phim:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUser) {
      setErrorMsg('Vui lòng đăng nhập để viết đánh giá cho bộ phim này!');
      return;
    }

    if (!hasPurchased) {
      setErrorMsg('🎟️ Bạn cần mua vé xem phim này trước khi viết đánh giá!');
      return;
    }

    if (!comment.trim()) {
      setErrorMsg('Vui lòng nhập lời nhận xét của bạn!');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      await axios.post(
        '/api/reviews',
        { movieId, rating, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg('Cảm ơn bạn đã gửi đánh giá cho bộ phim!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '40px', backgroundColor: '#111827', padding: '28px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          ⭐ ĐÁNH GIÁ & BÌNH LUẬN KHÁN GIẢ
        </h2>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px', color: '#f59e0b', fontWeight: 'bold' }}>
            {averageRating > 0 ? averageRating : 'Chưa có'} {averageRating > 0 && '/ 5'}
          </span>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>({totalReviews} lượt đánh giá)</span>
        </div>
      </div>

      {/* Form viết đánh giá */}
      <form onSubmit={handleSubmitReview} style={{ marginBottom: '32px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h4 style={{ color: '#e5e7eb', margin: 0, fontSize: '15px' }}>Viết Đánh Giá Của Bạn</h4>
          {currentUser && (
            hasPurchased ? (
              <span style={{ fontSize: '12px', color: '#10b981', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', padding: '2px 10px', borderRadius: '12px', fontWeight: 600 }}>
                ✅ Khán giả đã mua vé
              </span>
            ) : (
              <span style={{ fontSize: '12px', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', border: '1px solid #f59e0b', padding: '2px 10px', borderRadius: '12px' }}>
                🎟️ Chỉ khách hàng đã mua vé mới được viết đánh giá
              </span>
            )
          )}
        </div>

        {errorMsg && <div style={{ backgroundColor: '#ef444422', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>{errorMsg}</div>}
        {successMsg && <div style={{ backgroundColor: '#10b98122', border: '1px solid #10b981', color: '#6ee7b7', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>{successMsg}</div>}

        {hasReviewed ? (
          <div style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', color: '#93c5fd', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
            ✅ Bạn đã gửi đánh giá cho bộ phim này. Cảm ơn phản hồi đóng góp của bạn!
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>Đánh giá:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  disabled={!currentUser || !hasPurchased}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: currentUser && hasPurchased ? 'pointer' : 'not-allowed',
                    color: star <= rating ? '#f59e0b' : '#4b5563',
                    padding: '0 2px'
                  }}
                >
                  ★
                </button>
              ))}
              <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: 'bold', color: '#f59e0b' }}>
                {rating} sao
              </span>
            </div>

            <textarea
              rows={3}
              placeholder={
                !currentUser
                  ? "Vui lòng đăng nhập để bình luận..."
                  : !hasPurchased
                  ? "Bạn phải đặt vé xem phim này để được mở quyền đánh giá..."
                  : "Chia sẻ trải nghiệm và cảm nhận của bạn về bộ phim..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={!currentUser || !hasPurchased}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#1f2937',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
                marginBottom: '12px',
                opacity: (!currentUser || !hasPurchased) ? 0.6 : 1
              }}
            />

            <button
              type="submit"
              disabled={submitting || !currentUser || !hasPurchased}
              style={{
                backgroundColor: (currentUser && hasPurchased) ? '#e50914' : '#4b5563',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: (currentUser && hasPurchased) ? 'pointer' : 'not-allowed',
                opacity: (currentUser && hasPurchased) ? 1 : 0.6
              }}
            >
              {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </>
        )}
      </form>

      {/* Danh sách bình luận */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reviews.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>Chưa có bình luận nào. Hãy đặt vé ngay để trở thành người đầu tiên đánh giá bộ phim này!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e50914', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                    {(rev.userName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: '#f3f4f6', fontSize: '14px' }}>{rev.userName || 'Khách hàng'}</span>
                      <span style={{ fontSize: '11px', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.3)' }}>
                        ✓ Khán giả đã mua vé
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{dayjs(rev.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                  </div>
                </div>

                <div style={{ color: '#f59e0b', fontSize: '16px' }}>
                  {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                </div>
              </div>

              <p style={{ color: '#d1d5db', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>{rev.comment}</p>

              {/* Phản hồi từ Ban quản trị Admin */}
              {rev.adminReply && (
                <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'rgba(229, 9, 20, 0.08)', borderLeft: '3px solid #e50914', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👑 Phản hồi từ TNA Cinema:</span>
                    {rev.adminReplyAt && (
                      <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#9ca3af' }}>
                        ({dayjs(rev.adminReplyAt).format('DD/MM/YYYY HH:mm')})
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#e5e7eb', fontSize: '13.5px', margin: 0, lineHeight: 1.5 }}>
                    {rev.adminReply}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
