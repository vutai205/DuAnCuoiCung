import "./PointHistory.css";

export default function PointHistory() {
  const rewards: any[] = [];

  return (
    <div className="point-card">
      <div className="point-table">

        <div className="point-header">
          <div>Ngày giao dịch</div>
          <div>Loại giao dịch</div>
          <div>Tên giao dịch</div>
          <div>Số điểm</div>
        </div>

        {rewards.length === 0 ? (
          <div className="point-empty">
            Không có dữ liệu
          </div>
        ) : (
          rewards.map((item, index) => (
            <div className="point-row" key={index}>
              <div>{item.date}</div>
              <div>{item.type}</div>
              <div>{item.name}</div>
              <div>{item.point}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}