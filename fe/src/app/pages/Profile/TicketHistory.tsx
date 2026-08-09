import { useEffect, useState } from "react";
import axios from "axios";
import { QRCode, Tag, message } from "antd";
import { useNavigate } from "react-router-dom";
import "./TicketHistory.css";

export default function TicketHistory() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user") || "{}").token;
      const res = await axios.get("/api/bookings/my-bookings", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handlePayNow = (ticket: any) => {
    const expiresAt = ticket.expiresAt ? new Date(ticket.expiresAt).getTime() : 0;
    if (expiresAt && expiresAt < Date.now()) {
      message.error("Thời gian giữ chỗ 5 phút cho vé này đã hết hạn!");
      fetchTickets();
      return;
    }
    navigate(`/booking/${ticket.showtime?._id}`);
  };

  return (
    <div className="ticket-card">
      <div className="ticket-table">
        <div className="table-header">
          <div>Mã vé / Ngày đặt</div>
          <div>Tên phim</div>
          <div>Số ghế</div>
          <div>Số tiền</div>
          <div>Trạng thái</div>
          <div>Thao tác</div>
        </div>

        {loading ? (
          <div className="table-row">Đang tải dữ liệu...</div>
        ) : tickets.length === 0 ? (
          <div className="table-row">Không có giao dịch nào.</div>
        ) : (
          tickets.map((ticket, index) => {
            const isCash = ticket.paymentMethod === 'cash';
            const isExpired = !isCash && (ticket.status === 'cancelled' || (ticket.status === 'pending' && ticket.expiresAt && new Date(ticket.expiresAt).getTime() < Date.now()));

            return (
              <div
                className={`table-row ${index % 2 === 0 ? "active-row" : ""}`}
                key={ticket._id}
              >
                <div className="ticket-code-cell">
                  <strong className="ticket-code-text">#{ticket.ticketCode || ticket._id?.slice(-8).toUpperCase()}</strong>
                  <div className="ticket-date-text">{new Date(ticket.createdAt).toLocaleDateString("vi-VN")}</div>
                </div>
                <div className="movie-title-cell">{ticket.showtime?.movie?.title || "Phim rạp"}</div>
                <div><strong style={{ color: '#ff9800' }}>{ticket.seats?.join(", ") || "N/A"}</strong></div>
                <div>{ticket.totalPrice?.toLocaleString("vi-VN")}đ</div>
                <div>
                  {ticket.status === "confirmed" ? (
                    isCash ? (
                      <Tag color="cyan">Giữ chỗ tại quầy (Thanh toán sau)</Tag>
                    ) : (
                      <Tag color="green">Đã thanh toán (VNPay)</Tag>
                    )
                  ) : isExpired ? (
                    <Tag color="red">Đã hủy (Hết hạn 5p)</Tag>
                  ) : (
                    <Tag color="warning">Chờ thanh toán (Giữ 5p)</Tag>
                  )}

                  {ticket.isPrinted && (
                    <div style={{ marginTop: 4 }}>
                      <Tag color="purple">🖨️ Đã in vé tại quầy</Tag>
                    </div>
                  )}
                </div>
                <div className="ticket-action-btns">
                  {/* FIRST BUTTON: Xem vé hoặc Chi tiết vé hủy */}
                  <button 
                    className={`btn-view-ticket ${isExpired ? 'btn-cancelled-ticket' : ''}`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    {isExpired ? '🚫 Vé đã hủy' : '🎫 Xem vé'}
                  </button>

                  {/* SECOND BUTTON: Thanh toán (Chỉ hiển thị khi pending & VNPay) */}
                  {ticket.status === "pending" && !isCash && !isExpired && (
                    <button 
                      className="btn-pay-now"
                      onClick={() => handlePayNow(ticket)}
                    >
                      💳 Thanh toán
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="ticket-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="ticket-modal-card" onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setSelectedTicket(null)}>✕</button>
            <div className="ticket-modal-header">
              <h3>TRUNG TÂM CHIẾU PHIM QUỐC GIA</h3>
              <p>VÉ XEM PHIM ĐIỆN TỬ</p>
            </div>

            {/* If ticket is cancelled or expired 5 mins: DO NOT SHOW QR CODE */}
            {selectedTicket.status === 'cancelled' || (selectedTicket.paymentMethod !== 'cash' && selectedTicket.expiresAt && new Date(selectedTicket.expiresAt).getTime() < Date.now()) ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '2px dashed #ef4444', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '15px 0' }}>
                <h3 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800 }}>🚫 VÉ NÀY ĐÃ BỊ HỦY BỎ</h3>
                <p style={{ color: '#ff8a8a', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Lý do: Đã quá thời hạn giữ chỗ 5 phút mà chưa hoàn tất thanh toán.</p>
                <span style={{ fontSize: '0.82rem', color: '#aaa' }}>⚠️ Mã QR đã bị vô hiệu hóa. Vui lòng thực hiện chọn lại ghế để đặt vé mới!</span>
              </div>
            ) : (
              <div className="ticket-barcode-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                  <QRCode value={selectedTicket.ticketCode || selectedTicket._id} size={160} color="#000" bgColor="#fff" />
                </div>
                <div className="ticket-id" style={{ marginTop: '10px' }}>
                  MÃ SỐ VÉ: <strong>#{selectedTicket.ticketCode || selectedTicket._id?.toUpperCase()}</strong>
                </div>
              </div>
            )}

            <div className="ticket-modal-body">
              <div className="info-line">
                <span>Tên phim:</span>
                <strong>{selectedTicket.showtime?.movie?.title || "Phim chiếu"}</strong>
              </div>
              <div className="info-line">
                <span>Phòng chiếu:</span>
                <strong>{selectedTicket.showtime?.room?.name || "Phòng chiếu"}</strong>
              </div>
              <div className="info-line">
                <span>Ghế đã chọn:</span>
                <strong style={{ color: '#e50914', fontSize: '1.1rem' }}>{selectedTicket.seats?.join(', ')}</strong>
              </div>
              {selectedTicket.combos && selectedTicket.combos.length > 0 && (
                <div className="info-line">
                  <span>Combo đồ ăn:</span>
                  <strong>{selectedTicket.combos.map((c: any) => `${c.name} (x${c.count})`).join(', ')}</strong>
                </div>
              )}
              <div className="info-line">
                <span>Tổng tiền:</span>
                <strong style={{ color: '#4caf50' }}>{selectedTicket.totalPrice?.toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="info-line">
                <span>Hình thức:</span>
                <Tag color={selectedTicket.paymentMethod === 'cash' ? 'cyan' : 'blue'}>
                  {selectedTicket.paymentMethod === 'cash' ? '💵 Thanh toán tại quầy' : '💳 Thanh toán VNPay Online'}
                </Tag>
              </div>

              {/* Printed Status Tag */}
              {selectedTicket.isPrinted && (
                <div className="info-line" style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '8px 12px', borderRadius: '8px', border: '1px dashed #a855f7', marginTop: '10px' }}>
                  <span style={{ color: '#a855f7', fontWeight: 800 }}>⚠️ VÉ ĐÃ ĐƯỢC IN LÚC:</span>
                  <strong style={{ color: '#fff' }}>{new Date(selectedTicket.printedAt).toLocaleString('vi-VN')}</strong>
                </div>
              )}
            </div>

            <div className="ticket-modal-footer">
              {selectedTicket.status === 'cancelled' || (selectedTicket.paymentMethod !== 'cash' && selectedTicket.expiresAt && new Date(selectedTicket.expiresAt).getTime() < Date.now()) ? (
                <p style={{ fontSize: '0.85rem', color: '#ff4d4f', fontWeight: 600 }}>* Đơn hàng này không còn giá trị sử dụng.</p>
              ) : (
                <p style={{ fontSize: '0.8rem', color: '#888' }}>* Vui lòng đưa mã QR này cho nhân viên soát vé tại rạp để in vé vào phòng chiếu.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}