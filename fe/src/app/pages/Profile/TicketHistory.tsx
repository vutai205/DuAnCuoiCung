import { useEffect, useState } from "react";
import axios from "axios";
import "./TicketHistory.css";

export default function TicketHistory() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
          <div>Ngày giao dịch</div>
          <div>Tên phim</div>
          <div>Số ghế</div>
          <div>Số tiền</div>
          <div>Trạng thái</div>
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
              <div>{new Date(ticket.createdAt).toLocaleString("vi-VN")}</div>
              <div>{ticket.showtime?.movie?.title || "N/A"}</div>
              <div>{ticket.seats?.join(", ") || "N/A"}</div>
              <div>{ticket.totalPrice?.toLocaleString()}đ</div>
              <div>
                <span className={`status-${ticket.status}`}>
                  {ticket.status === "confirmed" ? "Thành công" : ticket.status === "cancelled" ? "Đã hủy" : "Chờ xử lý"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}