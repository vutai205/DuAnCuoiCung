import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
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
                    <div className="room-badge-title">Trung Tâm Chiếu Phim Quốc Gia - Hà Nội</div>
                    <div className="showtime-pills-grid">
                      {currentDayGroup.showtimes.map((st) => (
                        <div
                          key={st._id}
                          className="showtime-pill-card"
                          onClick={() => navigate(`/booking/${st._id}`)}
                        >
                          <span className="st-time">{dayjs(st.startTime).format('HH:mm')}</span>
                          <span className="st-room">{st.room.name}</span>
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

export default MovieDetailPage;
