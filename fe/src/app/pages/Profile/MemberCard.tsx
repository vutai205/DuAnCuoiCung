import { useState, useEffect } from "react";
import "./MemberCard.css";
import { getAuthUser } from "../../../services/authApi";

export default function MemberCard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getAuthUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const cardNumber = user?._id ? `M${user._id.slice(-8).toUpperCase()}` : "M00000000";
  const fullName = user?.name || "Khách Hàng";
  const email = user?.email || "N/A";
  const gender = user?.gender || "Chưa cập nhật";
  const address = user?.address || "Chưa cập nhật";
  const status = user ? "Đang hoạt động" : "Chưa kích hoạt";
  const activeDate = "25/08/2025";

  return (
    <div className="member-page">
      <div className="member-wrapper">
        <div className="member-card">
          <div className="row" style={{ gridTemplateColumns: "350px 1fr", gap: 40 }}>
            <div>
              <div className="cinema-card">
                <div className="card-logo" style={{ color: "#fff", fontWeight: "bold", fontSize: "20px" }}>
                  🎬 VENRI CINEMA
                </div>

                <div className="card-qr">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${cardNumber}`}
                    alt="qr"
                  />
                </div>

                <div className="card-footer">
                  <h3>{fullName}</h3>
                  <p>{cardNumber}</p>
                </div>
              </div>
            </div>

            <div className="member-info">
              <div className="row">
                <div className="form-group">
                  <label>Mã thẻ thành viên</label>
                  <input type="text" value={cardNumber} readOnly />
                </div>

                <div className="form-group">
                  <label>Chủ thẻ (Họ & Tên)</label>
                  <input type="text" value={fullName} readOnly />
                </div>
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Email liên hệ</label>
                  <input type="text" value={email} readOnly />
                </div>

                <div className="form-group">
                  <label>Giới tính</label>
                  <input type="text" value={gender} readOnly />
                </div>
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input type="text" value={address} readOnly />
                </div>

                <div className="form-group">
                  <label>Trạng thái thẻ</label>
                  <input type="text" value={status} readOnly className="active-status" />
                </div>
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Ngày kích hoạt</label>
                  <input type="text" value={activeDate} readOnly />
                </div>
              </div>

              <div className="member-alert">
                <h4>Thông tin đăng ký thẻ thành viên U22 của bạn đang hoạt động.</h4>
                <p>Vui lòng xuất trình mã QR thẻ tại quầy vé VENRI CINEMA khi nhận ưu đãi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}