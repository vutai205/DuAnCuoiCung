import { useState, useEffect } from "react";
import "./Profile.css";
import MemberCard from "./MemberCard";
import TicketHistory from "./TicketHistory";
import PointHistory from "./PointHistory";
import { getAuthUser } from "../../../services/authApi";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getAuthUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

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
                <label>Họ & Tên</label>
                <input type="text" value={user?.name || "Chưa cập nhật"} readOnly />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email || "Chưa cập nhật"}
                  readOnly
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label>Vai trò</label>
                <input type="text" value={user?.role === "admin" ? "Quản trị viên" : "Thành viên"} readOnly />
              </div>

              <div className="form-group">
                <label>Mã tài khoản</label>
                <input type="text" value={user?._id || "N/A"} readOnly />
              </div>
            </div>

            <div className="actions">
              <button className="password-btn" style={{ opacity: 0.7, cursor: "not-allowed" }} disabled>
                Đổi mật khẩu
              </button>

              <button className="save-btn" style={{ opacity: 0.7, cursor: "not-allowed" }} disabled>
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