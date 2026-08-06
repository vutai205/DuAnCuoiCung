import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuthUser, logout } from "../../../services/authApi";
import { Modal, Tag, Table } from "antd";
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getAuthUser();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const handleNavClick = (target: string) => {
    if (target === "home") {
      if (location.pathname !== "/") {
        navigate("/");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (target === "showtimes") {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          window.scrollTo({ top: 500, behavior: "smooth" });
        }, 100);
      } else {
        window.scrollTo({ top: 500, behavior: "smooth" });
      }
    } else {
      setActiveModal(target);
    }
  };

  const priceColumns = [
    {
      title: "Loại Ghế / Định Dạng",
      dataIndex: "type",
      key: "type",
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: "Ngày Thường (T2 - T5)",
      dataIndex: "weekday",
      key: "weekday"
    },
    {
      title: "Cuối Tuần & Lễ (T6 - CN)",
      dataIndex: "weekend",
      key: "weekend"
    }
  ];

  const priceData = [
    { key: "1", type: "Ghế Thường (2D Standard)", weekday: "75.000 VNĐ", weekend: "85.000 VNĐ" },
    { key: "2", type: "Ghế VIP (Vị trí trung tâm)", weekday: "85.000 VNĐ", weekend: "95.000 VNĐ" },
    { key: "3", type: "Ghế Đôi (Couple Screen)", weekday: "160.000 VNĐ", weekend: "180.000 VNĐ" },
    { key: "4", type: "Suất Chiếu IMAX 3D", weekday: "110.000 VNĐ", weekend: "130.000 VNĐ" }
  ];

  return (
    <header className="header">
      <div className="header-container">

        {/* Brand Logo */}
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => handleNavClick("home")}>
          <div className="brand-logo-badge">
            <span className="logo-icon">🎬</span>
            <div className="logo-text">
              <span className="logo-title">NCC CINEMA</span>
              <span className="logo-sub">Trung Tâm Chiếu Phim Quốc Gia</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <button className="nav-btn" onClick={() => handleNavClick("home")}>Trang chủ</button>
          <button className="nav-btn" onClick={() => handleNavClick("showtimes")}>Lịch chiếu</button>
          <button className="nav-btn" onClick={() => handleNavClick("news")}>Tin tức</button>
          <button className="nav-btn" onClick={() => handleNavClick("promotions")}>Khuyến mãi</button>
          <button className="nav-btn" onClick={() => handleNavClick("price")}>Giá vé</button>
          <button className="nav-btn" onClick={() => handleNavClick("about")}>Giới thiệu</button>
        </nav>

        {/* User Account Box */}
        <div className="user-box">
          {user ? (
            <>
              <span className="user-name-display">{user.name}</span>

              <div className="user-dropdown">
                <button
                  className="member-btn"
                  onClick={() => setOpen(!open)}
                >
                  MEMBER ▼
                </button>

                {open && (
                  <div className="user-dropdown-menu">
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setOpen(false)}>
                        👑 Trang quản trị Admin
                      </Link>
                    )}

                    <Link to="/profile" onClick={() => setOpen(false)}>
                      👤 Thông tin cá nhân
                    </Link>

                    <Link to="/member-card" onClick={() => setOpen(false)}>
                      💳 Thẻ thành viên
                    </Link>

                    <button
                      className="logout-btn"
                      onClick={handleLogout}
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="login-nav-btn">
              Đăng nhập
            </Link>
          )}
        </div>

      </div>

      {/* Modal Bảng Giá Vé */}
      <Modal
        title="🎟️ BẢNG GIÁ VÉ NIÊM YẾT - NCC CINEMA"
        open={activeModal === "price"}
        onCancel={() => setActiveModal(null)}
        footer={null}
        width={650}
      >
        <p style={{ color: "#64748b", marginBottom: 15 }}>
          Áp dụng cho tất cả các phòng chiếu tiêu chuẩn và phòng VIP tại Trung tâm chiếu phim Quốc gia.
        </p>
        <Table columns={priceColumns} dataSource={priceData} pagination={false} size="middle" />
        <div style={{ marginTop: 15, fontSize: "0.85rem", color: "#64748b" }}>
          * Lưu ý: Giá vé đã bao gồm thuế VAT. Học sinh, sinh viên và người cao tuổi được giảm 20% vào các ngày Thứ Hai - Thứ Năm.
        </div>
      </Modal>

      {/* Modal Tin Tức & Khuyến Mãi */}
      <Modal
        title={activeModal === "promotions" ? "🎁 ƯU ĐÃI & KHUYẾN MÃI" : "📰 TIN TỨC ĐIỆN ẢNH"}
        open={activeModal === "news" || activeModal === "promotions"}
        onCancel={() => setActiveModal(null)}
        footer={null}
        width={600}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ border: "1px solid #e2e8f0", padding: 15, borderRadius: 8 }}>
            <Tag color="red">HOT</Tag> <strong>Thứ Ba Vui Vẻ - Đồng giá 50k toàn quốc</strong>
            <p style={{ margin: "5px 0 0", color: "#475569", fontSize: "0.9rem" }}>
              Tất cả các suất chiếu vào ngày Thứ 3 hàng tuần chỉ từ 50.000đ cho mọi loại ghế thường và VIP.
            </p>
          </div>
          <div style={{ border: "1px solid #e2e8f0", padding: 15, borderRadius: 8 }}>
            <Tag color="gold">VNPAY</Tag> <strong>Giảm 20k khi thanh toán quét mã VNPAY-QR</strong>
            <p style={{ margin: "5px 0 0", color: "#475569", fontSize: "0.9rem" }}>
              Nhập mã NCC20K khi thanh toán đơn hàng đặt vé từ 100.000đ qua cổng VNPay Sandbox.
            </p>
          </div>
          <div style={{ border: "1px solid #e2e8f0", padding: 15, borderRadius: 8 }}>
            <Tag color="blue">COMBO</Tag> <strong>Ưu đãi Combo Bỏng Nước Thành Viên</strong>
            <p style={{ margin: "5px 0 0", color: "#475569", fontSize: "0.9rem" }}>
              Giảm ngay 15% khi mua kèm Bỏng ngô Phô mai / Caramel khi đặt vé trực tuyến.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Giới Thiệu */}
      <Modal
        title="🏛️ GIỚI THIỆU TRUNG TÂM CHIẾU PHIM QUỐC GIA (NCC CINEMA)"
        open={activeModal === "about"}
        onCancel={() => setActiveModal(null)}
        footer={null}
        width={650}
      >
        <p style={{ lineHeight: 1.6, color: "#334155" }}>
          <strong>Trung tâm Chiếu phim Quốc gia (NCC)</strong> là đơn vị sự nghiệp thuộc Bộ Văn hóa, Thể thao và Du lịch, có chức năng tổ chức chiếu phim phục vụ các nhiệm vụ chính trị, xã hội, hợp tác quốc tế; trưng bày điện ảnh; tổ chức các hoạt động dịch vụ chiếu phim.
        </p>
        <ul style={{ paddingLeft: 20, color: "#475569", lineHeight: 1.8 }}>
          <li>Trang thiết bị chiếu phim hiện đại 2D, 3D, IMAX và âm thanh Dolby Atmos tiêu chuẩn quốc tế.</li>
          <li>Địa chỉ: Số 87 Láng Hạ, Đống Đa, Hà Nội.</li>
          <li>Hotline hỗ trợ khách hàng: (024) 35141791</li>
        </ul>
      </Modal>

    </header>
  );
}