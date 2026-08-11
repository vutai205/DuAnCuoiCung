import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { QRCode, message as antMessage } from 'antd';
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
    { id: 'c3', name: 'Combo Gia Đình (2 Bỏng + 2 Nước)', desc: '2 Bỏng ngô Caramel + 2 Nước lớn', price: 135000, count: 0 },
  ]);

  useEffect(() => {
    const fetchApiFoods = async () => {
      try {
        const res = await axios.get('/api/foods');
        if (res.data && res.data.length > 0) {
          const apiCombos = res.data.map((f: any) => ({
            id: f._id,
            name: f.name,
            desc: `${f.category || 'Đồ ăn'} - Số lượng kho: ${f.quantity}`,
            price: f.price,
            count: 0
          }));
          setCombos(apiCombos);
        }
      } catch (err) {
        console.error('Không thể lấy danh sách đồ ăn:', err);
      }
    };
    fetchApiFoods();
  }, []);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'cash'>('vnpay');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);

  // Voucher states
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState<boolean>(false);

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

        // Restore active pending booking within 5 mins if user exited and returned
        const token = getToken();
        if (token && user) {
          try {
            const myBookingsRes = await axios.get('/api/bookings/my-bookings', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const activePending = myBookingsRes.data.find((b: any) => 
              b.showtime?._id === showtimeId && 
              b.status === 'pending' && 
              b.expiresAt && 
              new Date(b.expiresAt).getTime() > Date.now()
            );

            if (activePending) {
              setSelectedSeats(activePending.seats || []);
              const remainingSecs = Math.max(0, Math.floor((new Date(activePending.expiresAt).getTime() - Date.now()) / 1000));
              setTimeLeft(remainingSecs);
              antMessage.info('Đã khôi phục ghế giữ chỗ 5 phút trước đó của bạn!');
            }
          } catch (e) {
            console.error('Không thể khôi phục ghế giữ chỗ:', e);
          }
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
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          antMessage.error('⏱ Thời gian giữ chỗ 5 phút đã hết hạn! Ghế đã tự động giải phóng.');
          setSelectedSeats([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Get couple seat pair (e.g. H1 & H2, H3 & H4)
  const getCouplePair = (seatName: string, allSeats: SeatItem[]) => {
    const match = seatName.match(/^([A-Z]+)(\d+)$/);
    if (!match) return [seatName];
    const rowLetter = match[1];
    const seatNum = parseInt(match[2], 10);
    
    const currentSeatObj = allSeats.find(s => s.seatName === seatName);
    if (currentSeatObj?.type !== 'couple') return [seatName];

    // Odd seat pairs with next (1-2, 3-4, 5-6...), Even seat pairs with previous
    const pairNum = seatNum % 2 !== 0 ? seatNum + 1 : seatNum - 1;
    const pairName = `${rowLetter}${pairNum}`;
    const pairSeatObj = allSeats.find(s => s.seatName === pairName);

    if (pairSeatObj && pairSeatObj.type === 'couple' && !pairSeatObj.isBooked) {
      return [seatName, pairName].sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10);
        const numB = parseInt(b.replace(/\D/g, ''), 10);
        return numA - numB;
      });
    }
    return [seatName];
  };

  // Validate no single isolated empty seat in any row
  const checkIsolatedEmptySeat = (proposedSeats: string[], allSeats: SeatItem[]) => {
    const rows = Array.from(new Set(allSeats.map(s => s.seatName.charAt(0))));

    for (const rowLetter of rows) {
      const rowSeats = allSeats.filter(s => s.seatName.startsWith(rowLetter));
      rowSeats.sort((a, b) => {
        const numA = parseInt(a.seatName.replace(/\D/g, ''), 10);
        const numB = parseInt(b.seatName.replace(/\D/g, ''), 10);
        return numA - numB;
      });

      const isOccupied = (s: SeatItem) => s.isBooked || proposedSeats.includes(s.seatName);

      for (let i = 0; i < rowSeats.length; i++) {
        const currentEmpty = !isOccupied(rowSeats[i]);
        if (!currentEmpty) continue;

        const prevOccupied = i > 0 ? isOccupied(rowSeats[i - 1]) : false;
        const nextOccupied = i < rowSeats.length - 1 ? isOccupied(rowSeats[i + 1]) : false;

        if (prevOccupied && nextOccupied) {
          return true;
        }
      }
    }

    return false;
  };

  const handleToggleSeat = (seat: SeatItem) => {
    if (seat.isBooked) return;

    const targetSeats = getCouplePair(seat.seatName, showtimeData?.seats || []);
    const isAlreadySelected = targetSeats.every(s => selectedSeats.includes(s));

    let nextSeats: string[];
    if (isAlreadySelected) {
      nextSeats = selectedSeats.filter(s => !targetSeats.includes(s));
    } else {
      const toAdd = targetSeats.filter(s => !selectedSeats.includes(s));
      if (selectedSeats.length + toAdd.length > 8) {
        alert('Bạn chỉ được chọn tối đa 8 ghế trong một lần đặt!');
        return;
      }
      nextSeats = [...selectedSeats, ...toAdd];
    }

    if (nextSeats.length > 0 && checkIsolatedEmptySeat(nextSeats, showtimeData?.seats || [])) {
      alert('⚠️ Vui lòng không để trống 1 ghế đơn ở giữa các ghế chọn!');
      return;
    }

    setSelectedSeats(nextSeats);
    // Reset timer to 5 minutes when user modifies seat selection
    if (nextSeats.length > 0) {
      setTimeLeft(300);
    }
  };

  const handleComboChange = (id: string, delta: number) => {
    setCombos(prev =>
      prev.map(c => (c.id === id ? { ...c, count: Math.max(0, c.count + delta) } : c))
    );
  };

  const calculateSeatPrice = (seatName: string) => {
    if (!showtimeData) return 0;
    const base = showtimeData.ticketPrice;
    const seatObj = showtimeData.seats.find(s => s.seatName === seatName);
    if (!seatObj) return base;
    if (seatObj.type === 'vip') return base + 15000;
    if (seatObj.type === 'couple') return base + 15000;
    return base;
  };

  const ticketsTotal = selectedSeats.reduce((sum, seat) => sum + calculateSeatPrice(seat), 0);
  const combosTotal = combos.reduce((sum, c) => sum + c.price * c.count, 0);
  const rawTotal = ticketsTotal + combosTotal;
  const grandTotal = Math.max(0, rawTotal - discountAmount);

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) {
      setVoucherMessage({ type: 'error', text: 'Vui lòng nhập mã Voucher!' });
      return;
    }
    setIsValidatingVoucher(true);
    setVoucherMessage(null);
    try {
      const res = await axios.post('/api/vouchers/validate', {
        code: voucherInput.trim(),
        orderTotal: rawTotal
      });
      if (res.data.valid) {
        setAppliedVoucher(res.data.voucher);
        setDiscountAmount(res.data.discountAmount);
        setVoucherMessage({
          type: 'success',
          text: `Áp dụng thành công! Giảm ${res.data.discountAmount.toLocaleString('vi-VN')} đ`
        });
      }
    } catch (err: any) {
      setAppliedVoucher(null);
      setDiscountAmount(0);
      setVoucherMessage({
        type: 'error',
        text: err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn!'
      });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherInput('');
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherMessage(null);
  };

  const basePrice = showtimeData?.ticketPrice || 60000;
  const vipPrice = basePrice + 15000;
  const couplePrice = (basePrice + 15000) * 2;

  const formatSeatDisplay = (selected: string[]) => {
    if (selected.length === 0) return 'Chưa chọn';

    const rowsMap: { [row: string]: number[] } = {};
    selected.forEach(s => {
      const match = s.match(/^([A-Z]+)(\d+)$/);
      if (match) {
        const row = match[1];
        const num = parseInt(match[2], 10);
        if (!rowsMap[row]) rowsMap[row] = [];
        rowsMap[row].push(num);
      }
    });

    const parts: string[] = [];
    Object.keys(rowsMap).sort().forEach(row => {
      const nums = rowsMap[row].sort((a, b) => a - b);
      let i = 0;
      while (i < nums.length) {
        const start = nums[i];
        let end = start;
        while (i + 1 < nums.length && nums[i + 1] === end + 1) {
          end = nums[i + 1];
          i++;
        }
        if (start === end) {
          parts.push(`${row}${start}`);
        } else {
          parts.push(`${row}${start}-${row}${end}`);
        }
        i++;
      }
    });

    return parts.join(', ');
  };

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

    if (timeLeft <= 0) {
      alert('Thời gian giữ chỗ 5 phút đã hết hạn. Vui lòng chọn lại ghế!');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      const selectedCombosData = combos.filter(c => c.count > 0).map(c => ({
        foodId: c.id,
        name: c.name,
        count: c.count,
        price: c.price
      }));

      const payload = {
        showtimeId,
        seats: selectedSeats,
        combos: selectedCombosData,
        totalPrice: grandTotal,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
        discountAmount,
        paymentMethod
      };

      const res = await axios.post('/api/bookings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const booking = res.data;

      if (paymentMethod === 'vnpay') {
        const payRes = await axios.post('/api/payment/create_payment_url', {
          bookingId: booking._id,
          amount: grandTotal
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (payRes.data && payRes.data.paymentUrl) {
          window.location.href = payRes.data.paymentUrl;
          return;
        }
      }

      setCreatedBooking(booking);
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

  const rows = Array.from(new Set(showtimeData.seats.map(s => s.seatName.charAt(0))));

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const selectedCombos = combos.filter(c => c.count > 0);

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
            <span className="timer-label">Thời gian giữ chỗ 5p:</span>
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
              const hasCoupleSeats = rowSeats.some(s => s.type === 'couple');

              if (hasCoupleSeats) {
                const pairs: SeatItem[][] = [];
                for (let i = 0; i < rowSeats.length; i += 2) {
                  pairs.push(rowSeats.slice(i, i + 2));
                }

                return (
                  <div className="seat-row" key={rowLetter}>
                    <span className="row-label">{rowLetter}</span>
                    <div className="seats-list couple-row-list">
                      {pairs.map((pair, pIdx) => {
                        const isPairSelected = pair.some(s => selectedSeats.includes(s.seatName));
                        return (
                          <div
                            key={pIdx}
                            className={`couple-pair-wrapper ${isPairSelected ? 'selected-pair' : ''}`}
                          >
                            {pair.map(seat => {
                              const isSelected = selectedSeats.includes(seat.seatName);
                              const isMaintenance = seat.type === 'maintenance' || (seat as any).status === 'maintenance';
                              let seatClass = `seat-btn ${seat.type}`;
                              if (seat.isBooked) seatClass += ' booked';
                              if (isMaintenance) seatClass += ' maintenance';
                              if (isSelected) seatClass += ' selected';

                              return (
                                <button
                                  key={seat.seatName}
                                  className={seatClass}
                                  disabled={seat.isBooked || isMaintenance}
                                  onClick={() => handleToggleSeat(seat)}
                                  title={isMaintenance ? `${seat.seatName} - Ghế đang bảo trì/hỏng, không thể chọn` : `${seat.seatName} (${seat.type.toUpperCase()}) - ${calculateSeatPrice(seat.seatName).toLocaleString('vi-VN')}đ`}
                                >
                                  {isMaintenance ? '🛠️' : seat.seatName}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                    <span className="row-label">{rowLetter}</span>
                  </div>
                );
              }

              return (
                <div className="seat-row" key={rowLetter}>
                  <span className="row-label">{rowLetter}</span>
                  <div className="seats-list">
                    {rowSeats.map(seat => {
                      const isSelected = selectedSeats.includes(seat.seatName);
                      const isMaintenance = seat.type === 'maintenance' || (seat as any).status === 'maintenance';
                      let seatClass = `seat-btn ${seat.type}`;
                      if (seat.isBooked) seatClass += ' booked';
                      if (isMaintenance) seatClass += ' maintenance';
                      if (isSelected) seatClass += ' selected';

                      return (
                        <button
                          key={seat.seatName}
                          className={seatClass}
                          disabled={seat.isBooked || isMaintenance}
                          onClick={() => handleToggleSeat(seat)}
                          title={isMaintenance ? `${seat.seatName} - Ghế đang bảo trì/hỏng, không thể chọn` : `${seat.seatName} (${seat.type.toUpperCase()}) - ${calculateSeatPrice(seat.seatName).toLocaleString('vi-VN')}đ`}
                        >
                          {isMaintenance ? '🛠️' : seat.seatName}
                        </button>
                      );
                    })}
                  </div>
                  <span className="row-label">{rowLetter}</span>
                </div>
              );
            })}
          </div>

          {/* Seat Legends with Specific Prices */}
          <div className="seat-legends">
            <div className="legend-item">
              <span className="legend-box regular"></span> 
              Ghế Thường ({basePrice.toLocaleString('vi-VN')}đ)
            </div>
            <div className="legend-item">
              <span className="legend-box vip"></span> 
              Ghế VIP ({vipPrice.toLocaleString('vi-VN')}đ)
            </div>
            <div className="legend-item">
              <span className="legend-box couple"></span> 
              Ghế Đôi ({couplePrice.toLocaleString('vi-VN')}đ/cặp)
            </div>
            <div className="legend-item">
              <span className="legend-box selected"></span> Đang chọn
            </div>
            <div className="legend-item">
              <span className="legend-box booked"></span> Đã bán
            </div>
            <div className="legend-item">
              <span className="legend-box maintenance" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🛠️</span> Ghế Bảo Trì
            </div>
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

        {/* Right Sidebar: Detailed Payment Invoice Table */}
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
                <span className="value">VENRI CINEMA - {showtimeData.room}</span>
              </div>
              <div className="summary-row">
                <span className="label">Suất chiếu:</span>
                <span className="value">
                  {showtimeData.startTime ? dayjs(showtimeData.startTime).format('HH:mm - DD/MM/YYYY') : '---'}
                </span>
              </div>
            </div>

            {/* Detailed Payment Breakdown Table (Sleek Dark National Cinema Style) */}
            <div className="payment-breakdown-box">
              <h4 className="breakdown-heading">THÔNG TIN THANH TOÁN</h4>
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Danh mục</th>
                    <th className="text-center">Số lượng</th>
                    <th className="text-right">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSeats.length > 0 ? (
                    <tr>
                      <td>
                        <div className="item-name">Ghế rạp</div>
                        <div className="item-subtext">{formatSeatDisplay(selectedSeats)}</div>
                      </td>
                      <td className="text-center">{selectedSeats.length}</td>
                      <td className="text-right highlight-price">
                        {ticketsTotal.toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={3} className="empty-row-text">Chưa chọn ghế ngồi</td>
                    </tr>
                  )}

                  {selectedCombos.map(combo => (
                    <tr key={combo.id}>
                      <td>
                        <div className="item-name">{combo.name}</div>
                      </td>
                      <td className="text-center">{combo.count}</td>
                      <td className="text-right highlight-price">
                        {(combo.price * combo.count).toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Voucher Section */}
            <div className="voucher-section-box" style={{ margin: '15px 0', padding: '12px', background: '#131b2e', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎟️ MÃ GIẢM GIÁ / VOUCHER</span>
              </div>
              {appliedVoucher ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#064e3b', padding: '8px 12px', borderRadius: '6px', border: '1px solid #10b981' }}>
                  <div>
                    <strong style={{ color: '#10b981', display: 'block', fontSize: '0.9rem' }}>MÃ: {appliedVoucher.code}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>- {discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                    title="Gỡ bỏ mã này"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nhập mã (VD: TNA20K)"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    disabled={isValidatingVoucher || !voucherInput.trim()}
                    onClick={handleApplyVoucher}
                    style={{ padding: '8px 16px', background: '#e50914', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: isValidatingVoucher || !voucherInput.trim() ? 0.6 : 1 }}
                  >
                    {isValidatingVoucher ? '...' : 'Áp dụng'}
                  </button>
                </div>
              )}
              {voucherMessage && (
                <div style={{ fontSize: '0.8rem', marginTop: '6px', color: voucherMessage.type === 'success' ? '#10b981' : '#f87171' }}>
                  {voucherMessage.text}
                </div>
              )}
            </div>

            <div className="summary-section border-top">
              {discountAmount > 0 && (
                <div className="summary-row discount-row" style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <span>Giảm giá Voucher:</span>
                  <span style={{ fontWeight: 'bold' }}>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
                </div>
              )}
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
              disabled={selectedSeats.length === 0 || isSubmitting || timeLeft <= 0}
              onClick={handleCreateBooking}
            >
              {isSubmitting ? 'Đang xử lý...' : timeLeft <= 0 ? 'HẾT HẠN GIỮ CHỖ' : 'XÁC NHẬN ĐẶT VÉ'}
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Success Confirmation Modal with Real QR Code */}
      {createdBooking && (
        <div className="ticket-modal-backdrop">
          <div className="ticket-modal-card">
            <div className="ticket-success-header">
              <span className="success-icon">🎉</span>
              <h2>ĐẶT VÉ THÀNH CÔNG!</h2>
              <p>Cảm ơn bạn đã lựa chọn hệ thống TNA CINEMA</p>
            </div>

            <div className="ticket-details-box">
              <div className="ticket-qr-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1rem 0' }}>
                <div style={{ padding: '10px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                  <QRCode value={createdBooking.ticketCode || createdBooking._id} size={150} color="#000" bgColor="#fff" />
                </div>
                <div className="ticket-code" style={{ marginTop: '0.8rem' }}>
                  MÃ SỐ VÉ: <strong>#{createdBooking.ticketCode || createdBooking._id?.toUpperCase()}</strong>
                </div>
              </div>

              <div className="ticket-info-grid">
                <div className="info-item">
                  <span>Khách hàng:</span>
                  <strong>{user?.name}</strong>
                </div>
                <div className="info-item">
                  <span>Ghế ngồi:</span>
                  <strong className="red-text">{formatSeatDisplay(createdBooking.seats || [])}</strong>
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
