import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getShowtimesByMovie } from '../services/bookingApi';
import type { Showtime } from '../types/booking';
import '../styles/booking.css';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + 'đ';
}

export default function BookingPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedShowtimeId, setSelectedShowtimeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!movieId) return;

    const fetchShowtimes = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getShowtimesByMovie(movieId);
        setShowtimes(data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Không tải được suất chiếu.');
        } else {
          setError('Không tải được suất chiếu.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId]);

  const rooms = useMemo(() => {
    const map = new Map<string, { _id: string; name: string; totalSeats: number }>();
    showtimes.forEach((st) => {
      if (st.room && !map.has(st.room._id)) {
        map.set(st.room._id, {
          _id: st.room._id,
          name: st.room.name,
          totalSeats: st.room.totalSeats,
        });
      }
    });
    return Array.from(map.values());
  }, [showtimes]);

  const filteredShowtimes = useMemo(
    () => showtimes.filter((st) => st.room._id === selectedRoomId),
    [showtimes, selectedRoomId]
  );

  const selectedShowtime = showtimes.find((st) => st._id === selectedShowtimeId);

  const handleContinue = () => {
    if (!selectedShowtimeId) return;
    navigate(`/booking/seats/${selectedShowtimeId}`);
  };

  return (
    <div className="booking-page">
      <header className="booking-header">
        <Link to="/movies" className="booking-back">
          ← Quay lại danh sách phim
        </Link>
        <h1>Đặt vé xem phim</h1>
        <p className="booking-subtitle">Chọn rạp chiếu và suất chiếu phù hợp</p>
      </header>

      {loading && <p className="booking-status">Đang tải suất chiếu...</p>}
      {error && <div className="booking-alert booking-alert--error">{error}</div>}

      {!loading && !error && showtimes.length === 0 && (
        <p className="booking-status">Phim này chưa có suất chiếu.</p>
      )}

      {!loading && showtimes.length > 0 && (
        <div className="booking-steps">
          <section className="booking-step">
            <div className="booking-step__title">
              <span className="booking-step__num">1</span>
              <h2>Chọn rạp / phòng chiếu</h2>
            </div>
            <div className="room-grid">
              {rooms.map((room) => (
                <button
                  key={room._id}
                  type="button"
                  className={`room-card ${selectedRoomId === room._id ? 'room-card--active' : ''}`}
                  onClick={() => {
                    setSelectedRoomId(room._id);
                    setSelectedShowtimeId('');
                  }}
                >
                  <span className="room-card__icon">🎭</span>
                  <strong>{room.name}</strong>
                  <span>{room.totalSeats} ghế</span>
                </button>
              ))}
            </div>
          </section>

          {selectedRoomId && (
            <section className="booking-step">
              <div className="booking-step__title">
                <span className="booking-step__num">2</span>
                <h2>Chọn suất chiếu</h2>
              </div>
              {filteredShowtimes.length === 0 ? (
                <p className="booking-status">Rạp này chưa có suất chiếu cho phim.</p>
              ) : (
                <div className="showtime-grid">
                  {filteredShowtimes.map((st) => (
                    <button
                      key={st._id}
                      type="button"
                      className={`showtime-card ${selectedShowtimeId === st._id ? 'showtime-card--active' : ''}`}
                      onClick={() => setSelectedShowtimeId(st._id)}
                    >
                      <span className="showtime-card__time">{formatDateTime(st.startTime)}</span>
                      <span className="showtime-card__price">{formatPrice(st.ticketPrice)}/vé</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {selectedShowtime && (
            <section className="booking-summary">
              <h3>Thông tin đã chọn</h3>
              <ul>
                <li>
                  <strong>Rạp:</strong> {selectedShowtime.room.name}
                </li>
                <li>
                  <strong>Suất chiếu:</strong> {formatDateTime(selectedShowtime.startTime)}
                </li>
                <li>
                  <strong>Giá vé:</strong> {formatPrice(selectedShowtime.ticketPrice)}
                </li>
              </ul>
              <button type="button" className="booking-btn" onClick={handleContinue}>
                Tiếp tục chọn ghế →
              </button>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
