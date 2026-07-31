import { useState } from "react";
import "./Profile.css";
import MemberCard from "./MemberCard";
import TicketHistory from "./TicketHistory";
import PointHistory from "./PointHistory";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        <h1 className="profile-title">Thông tin cá nhân</h1>

        <div className="tabs">
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Tài khoản của tôi
          </button>

          <button
            className={activeTab === "member" ? "active" : ""}
            onClick={() => setActiveTab("member")}
          >
            Thông tin thẻ thành viên
          </button>

          <button
            className={activeTab === "ticket" ? "active" : ""}
            onClick={() => setActiveTab("ticket")}
          >
            Lịch sử mua vé
          </button>

          <button
            className={activeTab === "point" ? "active" : ""}
            onClick={() => setActiveTab("point")}
          >
            Lịch sử điểm thưởng
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="profile-card">
            <div className="row">
              <div className="form-group">
                <label>Họ</label>
                <input type="text" value="Việt Anh" readOnly />
              </div>

              <div className="form-group">
                <label>Tên</label>
                <input type="text" value="Lê Đức" readOnly />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="text" value="0357218050" readOnly />
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input type="text" value="Hà Nội" readOnly />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input type="text" value="vietanh" readOnly />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value="leducvietanh0104@gmail.com"
                  readOnly
                />
              </div>
            </div>

            <div className="actions">
              <button className="password-btn">
                Đổi mật khẩu
              </button>

              <button className="save-btn">
                Lưu thông tin
              </button>
            </div>
          </div>
        )}

        {activeTab === "member" && <MemberCard />}

        {activeTab === "ticket" && <TicketHistory />}

        {activeTab === "point" && <PointHistory />}

      </div>
    </div>
  );
}