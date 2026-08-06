import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { getAuthUser, getToken } from '../../services/authApi';
import './BookingPage.css';

interface SeatItem {
  seatName: string;
  type: string; // 'regular' | 'vip' | 'couple'
  isBooked: boolean;
}

interface ShowtimeData {
  showtimeId: string;
  room: string;
  ticketPrice: number;
  seats: SeatItem[];
  movieTitle?: string;
  startTime?: string;
}

interface FoodCombo {
  id: string;
  name: string;
  desc: string;
  price: number;
  count: number;
}

const BookingPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const user = getAuthUser();

  const [loading, setLoading] = useState<boolean>(true);
  const [showtimeData, setShowtimeData] = useState<ShowtimeData | null>(null);
  const [movieInfo, setMovieInfo] = useState<{ title: string; poster: string; duration: number } | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  // Timer 5 minutes seat hold
  const [timeLeft, setTimeLeft] = useState<number>(300);

  // Food combos
  const [combos, setCombos] = useState<FoodCombo[]>([
    { id: 'c1', name: 'Combo Solo (1 Bỏng + 1 Nước)', desc: '1 Bỏng ngô 60oz + 1 Nước ngọt 22oz', price: 65000, count: 0 },
    { id: 'c2', name: 'Combo Đôi (1 Bỏng + 2 Nước)', desc: '1 Bỏng ngô 60oz + 2 Nước ngọt 22oz', price: 95000, count: 0 },
    { id: 'c3', name: 'Combo Family (2 Bỏng + 2 Nước)', desc: '2 Bỏng ngô Caramel + 2 Nước lớn', price: 135000, count: 0 },
  ]);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'cash'>('vnpay');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);

  useEffect(() => {
    const fetchSeatLayout = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/showtimes/${showtimeId}/seats`);
        setShowtimeData(res.data);

        // Fetch full showtime details to get movie title & start time
        const stRes = await axios.get('/api/showtimes');
        const currentSt = stRes.data.find((item: any) => item._id === showtimeId);
        if (currentSt && currentSt.movie) {
          setMovieInfo({
            title: typeof currentSt.movie === 'object' ? currentSt.movie.title : 'Phim chiếu',
            poster: typeof currentSt.movie === 'object' ? currentSt.movie.poster : '',
            duration: typeof currentSt.movie === 'object' ? currentSt.movie.duration : 120,
          });
          setShowtimeData(prev => prev ? { ...prev, startTime: currentSt.startTime } : null);
        }
      } catch (err) {
        console.error('Lỗi khi tải sơ đồ ghế:', err);
      } finally {
        setLoading(false);
      }
    };

    if (showtimeId) fetchSeatLayout();
  }, [showtimeId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleToggleSeat = (seat: SeatItem) => {
    if (seat.isBooked) return;
    if (selectedSeats.includes(seat.seatName)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat.seatName));
    } else {
      if (selectedSeats.length >= 8) {
        alert('Bạn chỉ được chọn tối đa 8 ghế trong một lần đặt!');
        return;
      }
      setSelectedSeats([...selectedSeats, seat.seatName]);
    }
  };

  const handleComboChange = (id: string, delta: number) => {
    setCombos(prev =>
      prev.map(c => (c.id === id ? { ...c, count: Math.max(0, c.count + delta) } : c))
    );
  };

  // Price calculations
  const calculateSeatPrice = (seatName: string) => {
    if (!showtimeData) return 0;
    const base = showtimeData.ticketPrice;
    const seatObj = showtimeData.seats.find(s => s.seatName === seatName);
    if (!seatObj) return base;
    if (seatObj.type === 'vip') return base + 15000;
    if (seatObj.type === 'couple') return Math.round(base * 1.8);
    return base;
  };

  const ticketsTotal = selectedSeats.reduce((sum, seat) => sum + calculateSeatPrice(seat), 0);
  const combosTotal = combos.reduce((sum, c) => sum + c.price * c.count, 0);
  const grandTotal = ticketsTotal + combosTotal;

  const handleCreateBooking = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để tiến hành đặt vé!');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ghế ngồi!');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      const payload = {
        showtimeId,
        seats: selectedSeats,
        totalPrice: grandTotal
      };

      const res = await axios.post('/api/bookings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCreatedBooking(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn đặt vé');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-loading">
        <div className="spinner"></div>
        <p>Đang tải sơ đồ ghế phòng chiếu...</p>
      </div>
    );
  }

  if (!showtimeData) {
    return (
      <div className="booking-error">
        <h2>Không tìm thấy thông tin suất chiếu</h2>
        <button onClick={() => navigate('/')}>Về Trang chủ</button>
      </div>
    );
  }

  // Format seat grid by rows A, B, C...
  const rows = Array.from(new Set(showtimeData.seats.map(s => s.seatName.charAt(0))));

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="booking-page-container">
      {/* Header Info Bar */}
      <div className="booking-header-bar">
        <div className="bar-content">
          <div className="movie-summary">
            <h3>{movieInfo?.title || 'Phim Chiếu Rạp'}</h3>
            <span>{showtimeData.room} • {showtimeData.startTime ? dayjs(showtimeData.startTime).format('HH:mm - DD/MM/YYYY') : 'Suất chiếu'}</span>
          </div>

          <div className="timer-box">
            <span className="timer-label">Thời gian giữ ghế:</span>
            <span className={`timer-clock ${timeLeft < 60 ? 'warning' : ''}`}>
              ⏱ {formatTimer(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="booking-main-layout">
        {/* Left Area: Screen & Seat Grid */}
        <div className="seat-selection-area">
          <div className="screen-container">
            <div className="curved-screen">MÀN HÌNH CHIẾU</div>
            <div className="screen-light"></div>
          </div>

          {/* Seat Map Matrix */}
          <div className="seat-matrix">
            {rows.map(rowLetter => {
              const rowSeats = showtimeData.seats.filter(s => s.seatName.startsWith(rowLetter));
              return (
                <div className="seat-row" key={rowLetter}>
                  <span className="row-label">{rowLetter}</span>
                  <div className="seats-list">
                    {rowSeats.map(seat => {
                      const isSelected = selectedSeats.includes(seat.seatName);
                      let seatClass = `seat-btn ${seat.type}`;
                      if (seat.isBooked) seatClass += ' booked';
                      if (isSelected) seatClass += ' selected';

                      return (
                        <button
                          key={seat.seatName}
                          className={seatClass}
                          disabled={seat.isBooked}
                          onClick={() => handleToggleSeat(seat)}
                          title={`${seat.seatName} (${seat.type.toUpperCase()}) - ${calculateSeatPrice(seat.seatName).toLocaleString('vi-VN')}đ`}
                        >
                          {seat.seatName}
                        </button>
                      );
                    })}
                  </div>
                  <span className="row-label">{rowLetter}</span>
                </div>
              );
            })}
          </div>

          {/* Seat Legends */}
          <div className="seat-legends">
            <div className="legend-item"><span className="legend-box regular"></span> Ghế Thường</div>
            <div className="legend-item"><span className="legend-box vip"></span> Ghế VIP</div>
            <div className="legend-item"><span className="legend-box couple"></span> Ghế Đôi</div>
            <div className="legend-item"><span className="legend-box selected"></span> Đang chọn</div>
            <div className="legend-item"><span className="legend-box booked"></span> Đã bán</div>
          </div>

          {/* Food Combos Section */}
          <div className="food-combos-section">
            <h3 className="section-title">🍿 CHỌN BỎNG NƯỚC (COMBO KHUYẾN MÃI)</h3>
            <div className="combos-grid">
              {combos.map(combo => (
                <div className="combo-card" key={combo.id}>
                  <div className="combo-details">
                    <h4>{combo.name}</h4>
                    <p>{combo.desc}</p>
                    <span className="combo-price">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.price)}
                    </span>
                  </div>
                  <div className="combo-stepper">
                    <button onClick={() => handleComboChange(combo.id, -1)} disabled={combo.count === 0}>-</button>
                    <span>{combo.count}</span>
                    <button onClick={() => handleComboChange(combo.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Checkout Summary */}
        <div className="checkout-summary-sidebar">
          <div className="summary-card">
            <h3 className="summary-title">TỔNG KẾT ĐẶT VÉ</h3>

            <div className="summary-section">
              <div className="summary-row">
                <span className="label">Phim:</span>
                <strong className="value">{movieInfo?.title}</strong>
              </div>
              <div className="summary-row">
                <span className="label">Rạp / Phòng:</span>
                <span className="value">{showtimeData.room}</span>
              </div>
              <div className="summary-row">
                <span className="label">Suất chiếu:</span>
                <span className="value">
                  {showtimeData.startTime ? dayjs(showtimeData.startTime).format('HH:mm - DD/MM/YYYY') : '---'}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Ghế chọn:</span>
                <strong className="value seat-highlight">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}
                </strong>
              </div>
            </div>

            <div className="summary-section border-top">
              <div className="summary-row">
                <span>Tiền vé ({selectedSeats.length} ghế):</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticketsTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Bỏng nước:</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combosTotal)}</span>
              </div>
              <div className="summary-row total-price-row">
                <span>TỔNG TIỀN:</span>
                <span className="grand-price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="payment-options-box">
              <h4>Phương thức thanh toán</h4>
              <label className={`payment-option ${paymentMethod === 'vnpay' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="vnpay"
                  checked={paymentMethod === 'vnpay'}
                  onChange={() => setPaymentMethod('vnpay')}
                />
                <span>💳 VNPAY Gateway (Thẻ/QR Code)</span>
              </label>

              <label className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                />
                <span>💵 Thanh toán giữ chỗ tại quầy</span>
              </label>
            </div>

            <button
              className="btn-checkout-submit"
              disabled={selectedSeats.length === 0 || isSubmitting}
              onClick={handleCreateBooking}
            >
              {isSubmitting ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT VÉ'}
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Success Confirmation Modal */}
      {createdBooking && (
        <div className="ticket-modal-backdrop">
          <div className="ticket-modal-card">
            <div className="ticket-success-header">
              <span className="success-icon">🎉</span>
              <h2>ĐẶT VÉ THÀNH CÔNG!</h2>
              <p>Cảm ơn bạn đã lựa chọn Trung tâm chiếu phim Quốc gia</p>
            </div>

            <div className="ticket-details-box">
              <div className="ticket-qr-section">
                <div className="barcode-mock">||| | |||| | ||| |||| |||</div>
                <div className="ticket-code">MÃ VÉ: <strong>#{createdBooking._id?.slice(-8).toUpperCase()}</strong></div>
              </div>

              <div className="ticket-info-grid">
                <div className="info-item">
                  <span>Khách hàng:</span>
                  <strong>{user?.name}</strong>
                </div>
                <div className="info-item">
                  <span>Ghế ngồi:</span>
                  <strong className="red-text">{createdBooking.seats?.join(', ')}</strong>
                </div>
                <div className="info-item">
                  <span>Phòng chiếu:</span>
                  <strong>{showtimeData.room}</strong>
                </div>
                <div className="info-item">
                  <span>Tổng tiền:</span>
                  <strong className="green-text">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(createdBooking.totalPrice)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="ticket-modal-footer">
              <button className="btn-secondary" onClick={() => navigate('/profile')}>
                Xem vé trong Hồ sơ
              </button>
              <button className="btn-primary" onClick={() => navigate('/')}>
                Trở về Trang chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
