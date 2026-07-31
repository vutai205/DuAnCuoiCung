import { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <header className="header">
      <div className="header-container">

        <div className="logo">
          <img
            src="https://chieuphimquocgia.com.vn/_next/static/media/logo.9f3e8e6f.png"
            alt="logo"
          />
        </div>

        <nav className="nav-menu">
          <Link to="/">Trang chủ</Link>
          <Link to="/">Lịch chiếu</Link>
          <Link to="/">Tin tức</Link>
          <Link to="/">Khuyến mãi</Link>
          <Link to="/">Giá vé</Link>
          <Link to="/">Liên hoan phim</Link>
          <Link to="/">Giới thiệu</Link>
        </nav>

        <div className="user-box">
          <span>Đức Việt Anh</span>

          <div className="user-dropdown">
            <button
              className="member-btn"
              onClick={() => setOpen(!open)}
            >
              MEMBER ▼
            </button>

            {open && (
              <div className="dropdown-menu">

                <Link to="/profile">
                  Thông tin cá nhân
                </Link>

                <Link to="/member-card">
                  Thẻ thành viên
                </Link>

                <button
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>

              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}