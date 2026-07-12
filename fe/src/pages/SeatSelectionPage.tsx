import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { createBooking, getShowtimeSeats } from '../services/bookingApi';
import { validatePromo } from '../services/promoApi';
import type { SeatStatus } from '../types/booking';
import type { PromoValidation } from '../types/promo';
import '../styles/booking.css';

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + 'đ';
}

function groupSeatsByRow(seats: SeatStatus[]) {
  const rows = new Map<string, SeatStatus[]>();

  seats.forEach((seat) => {
    const match = seat.seatName.match(/^([A-Z]+)(\d+)$/);
    if (!match) return;
    const row = match[1];
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row)!.push(seat);
  });

  rows.forEach((rowSeats) => {
    rowSeats.sort((a, b) => {
      const numA = parseInt(a.seatName.replace(/^[A-Z]+/, ''), 10);
      const numB = parseInt(b.seatName.replace(/^[A-Z]+/, ''), 10);
      return numA - numB;
    });
  });

  return Array.from(rows.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function SeatSelectionPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState('');
  const [ticketPrice, setTicketPrice] = useState(0);
  const [seats, setSeats] = useState<SeatStatus[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoValidation | null>(null);

  useEffect(() => {
    if (!showtimeId) return;

    const fetchSeats = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getShowtimeSeats(showtimeId);
        setRoomName(data.room);
        setTicketPrice(data.ticketPrice);
        setSeats(data.seats);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Không tải được sơ đồ ghế.');
        } else {
          setError('Không tải được sơ đồ ghế.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [showtimeId]);

  const seatRows = useMemo(() => groupSeatsByRow(seats), [seats]);
  const originalPrice = selectedSeats.length * ticketPrice;
  const discountAmount = appliedPromo?.discount ?? 0;
  const totalPrice = appliedPromo?.finalPrice ?? originalPrice;

  const toggleSeat = (seat: SeatStatus) => {
    if (seat.isBooked) return;
    setSelectedSeats((prev) =>
      prev.includes(seat.seatName)
        ? prev.filter((s) => s !== seat.seatName)
        : [...prev, seat.seatName]
    );
    setAppliedPromo(null);
    setPromoError('');
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim() || originalPrice === 0) return;

    setPromoLoading(true);
    setPromoError('');
    try {
      const result = await validatePromo(promoInput.trim(), originalPrice);
      setAppliedPromo(result);
    } catch (err) {
      setAppliedPromo(null);
      if (axios.isAxiosError(err)) {
        setPromoError(err.response?.data?.message || 'Mã giảm giá không hợp lệ.');
      } else {
        setPromoError('Mã giảm giá không hợp lệ.');
      }
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  const handleBooking = async () => {
    if (!showtimeId || selectedSeats.length === 0) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createBooking(showtimeId, selectedSeats, appliedPromo?.promo.code);
      setSuccess('Đặt vé thành công!');
      setTimeout(() => navigate('/movies'), 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Đặt vé thất bại.');
      } else {
        setError('Đặt vé thất bại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <header className="booking-header">
        <Link to="/movies" className="booking-back">
          ← Quay lại
        </Link>
        <h1>Chọn ghế</h1>
        <p className="booking-subtitle">
          {roomName ? `Rạp: ${roomName}` : 'Đang tải...'}
        </p>
      </header>

      {loading && <p className="booking-status">Đang tải sơ đồ ghế...</p>}
      {error && <div className="booking-alert booking-alert--error">{error}</div>}
      {success && <div className="booking-alert booking-alert--success">{success}</div>}

      {!loading && seats.length > 0 && (
        <>
          <div className="screen">MÀN HÌNH</div>

          <div className="seat-map">
            {seatRows.map(([row, rowSeats]) => (
              <div key={row} className="seat-row">
                <span className="seat-row__label">{row}</span>
                <div className="seat-row__seats">
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatName);
                    let className = 'seat';
                    if (seat.isBooked) className += ' seat--booked';
                    else if (isSelected) className += ' seat--selected';
                    else className += ' seat--available';

                    return (
                      <button
                        key={seat.seatName}
                        type="button"
                        className={className}
                        disabled={seat.isBooked}
                        onClick={() => toggleSeat(seat)}
                        title={seat.seatName}
                      >
                        {seat.seatName.replace(row, '')}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="seat-legend">
            <span><i className="seat seat--available seat--demo" /> Trống</span>
            <span><i className="seat seat--selected seat--demo" /> Đang chọn</span>
            <span><i className="seat seat--booked seat--demo" /> Đã đặt</span>
          </div>

          <div className="booking-summary">
            <h3>Thông tin đặt vé</h3>

            <div className="promo-box">
              <label htmlFor="promo-code">Mã giảm giá / Khuyến mại</label>
              <div className="promo-box__row">
                <input
                  id="promo-code"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã (VD: CINE10)"
                  disabled={!!appliedPromo}
                />
                {appliedPromo ? (
                  <button type="button" className="promo-box__btn promo-box__btn--remove" onClick={handleRemovePromo}>
                    Xóa
                  </button>
                ) : (
                  <button
                    type="button"
                    className="promo-box__btn"
                    onClick={handleApplyPromo}
                    disabled={!promoInput.trim() || originalPrice === 0 || promoLoading}
                  >
                    {promoLoading ? '...' : 'Áp dụng'}
                  </button>
                )}
              </div>
              {promoError && <p className="promo-box__error">{promoError}</p>}
              {appliedPromo && (
                <p className="promo-box__success">
                  Đã áp dụng <strong>{appliedPromo.promo.code}</strong> — {appliedPromo.promo.title}
                </p>
              )}
              <Link to="/promotions" className="promo-box__link">Xem tất cả mã khuyến mại →</Link>
            </div>

            <ul>
              <li>
                <strong>Ghế đã chọn:</strong>{' '}
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}
              </li>
              <li>
                <strong>Số lượng:</strong> {selectedSeats.length} vé
              </li>
              {appliedPromo && (
                <>
                  <li>
                    <strong>Tạm tính:</strong> {formatPrice(originalPrice)}
                  </li>
                  <li className="booking-summary__discount">
                    <strong>Giảm giá:</strong> -{formatPrice(discountAmount)}
                  </li>
                </>
              )}
              <li>
                <strong>Tổng tiền:</strong> {formatPrice(totalPrice)}
              </li>
            </ul>
            <button
              type="button"
              className="booking-btn"
              disabled={selectedSeats.length === 0 || submitting}
              onClick={handleBooking}
            >
              {submitting ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
