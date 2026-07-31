import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthUser, logout } from "../../../services/authApi";
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">

        <div className="logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
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
          {user ? (
            <>
              <span>{user.name}</span>

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
                        Trang quản trị
                      </Link>
                    )}

                    <Link to="/profile" onClick={() => setOpen(false)}>
                      Thông tin cá nhân
                    </Link>

                    <Link to="/member-card" onClick={() => setOpen(false)}>
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
            </>
          ) : (
            <Link to="/login" className="login-nav-btn">
              Đăng nhập
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}