import { useEffect, useState } from "react";
import axios from "axios";
import "./TicketHistory.css";

export default function TicketHistory() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
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
    fetchTickets();
  }, []);

  return (
    <div className="ticket-card">
      <div className="ticket-table">
        <div className="table-header">
          <div>Mã vé / Ngày đặt</div>
          <div>Tên phim</div>
          <div>Số ghế</div>
          <div>Số tiền</div>
          <div>Trạng thái</div>
          <div>Chi tiết</div>
        </div>

        {loading ? (
          <div className="table-row">Đang tải dữ liệu...</div>
        ) : tickets.length === 0 ? (
          <div className="table-row">Không có giao dịch nào.</div>
        ) : (
          tickets.map((ticket, index) => (
            <div
              className={`table-row ${index % 2 === 0 ? "active-row" : ""}`}
              key={ticket._id}
            >
              <div>
                <strong>#{ticket._id?.slice(-6).toUpperCase()}</strong>
                <br />
                <small style={{ color: '#888' }}>{new Date(ticket.createdAt).toLocaleDateString("vi-VN")}</small>
              </div>
              <div>{ticket.showtime?.movie?.title || "Phim rạp"}</div>
              <div><strong style={{ color: '#ff9800' }}>{ticket.seats?.join(", ") || "N/A"}</strong></div>
              <div>{ticket.totalPrice?.toLocaleString("vi-VN")}đ</div>
              <div>
                <span className={`status-${ticket.status}`}>
                  {ticket.status === "confirmed" ? "Thành công" : ticket.status === "cancelled" ? "Đã hủy" : "Chờ xử lý"}
                </span>
              </div>
              <div>
                <button 
                  className="btn-view-ticket"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  🎫 Xem vé
                </button>
              </div>
            </div>
          ))
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

            <div className="ticket-barcode-box">
              <div className="barcode-graphic">|||| | ||| |||| | ||| ||||</div>
              <div className="ticket-id">MÃ SỐ VÉ: <strong>#{selectedTicket._id?.toUpperCase()}</strong></div>
            </div>

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
              <div className="info-line">
                <span>Tổng tiền:</span>
                <strong style={{ color: '#4caf50' }}>{selectedTicket.totalPrice?.toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="info-line">
                <span>Trạng thái:</span>
                <span className={`status-${selectedTicket.status}`}>
                  {selectedTicket.status === 'confirmed' ? 'Đã xác nhận & Thanh toán' : 'Chờ xử lý'}
                </span>
              </div>
            </div>

            <div className="ticket-modal-footer">
              <p style={{ fontSize: '0.8rem', color: '#888' }}>* Vui lòng đưa mã vé này cho nhân viên soát vé tại rạp để vào phòng chiếu.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}