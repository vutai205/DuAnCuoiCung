import "./TicketHistory.css";

export default function TicketHistory() {
  const tickets = [
    {
      date: "23:21 18/09/2025",
      movie: "THE CONJURING: NGHI LỄ CUỐI CÙNG - T16",
      type: "Mua online",
      quantity: 2,
      amount: "190.000đ",
    },
    {
      date: "23:52 25/08/2025",
      movie: "MƯA ĐỎ - T13",
      type: "Mua online",
      quantity: 2,
      amount: "170.000đ",
    },
  ];

  return (
    <div className="ticket-card">
      <div className="ticket-table">
        <div className="table-header">
          <div>Ngày giao dịch</div>
          <div>Tên phim</div>
          <div>Loại giao dịch</div>
          <div>Số vé</div>
          <div>Số tiền</div>
        </div>

        {tickets.map((ticket, index) => (
          <div
            className={`table-row ${index % 2 === 0 ? "active-row" : ""}`}
            key={index}
          >
            <div>{ticket.date}</div>
            <div>{ticket.movie}</div>
            <div>{ticket.type}</div>
            <div>{ticket.quantity}</div>
            <div>{ticket.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}