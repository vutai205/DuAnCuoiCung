import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-menu">

        <Link to="/">Chính sách</Link>
        <Link to="/">Lịch chiếu</Link>
        <Link to="/">Tin tức</Link>
        <Link to="/">Giá vé</Link>
        <Link to="/contact">Hỏi đáp</Link>
        <Link to="/contact">Đặt vé nhóm</Link>
        <Link to="/contact">Liên hệ</Link>

      </div>

      <div className="socials">
        <span>📘</span>
        <span>💬</span>
        <span>▶️</span>
      </div>

      <div className="footer-content">

        <p style={{ fontWeight: "bold", fontSize: "1.05rem", color: "#e50914" }}>
          TNA CINEMA — Hệ Thống Rạp Chiếu Phim Đẳng Cấp
        </p>

        <p>
          Bản quyền thuộc Cụm Rạp TNA CINEMA
        </p>

        <p>
          Địa chỉ: Số 87 Láng Hạ, Đống Đa, Hà Nội
        </p>

        <p>
          Hotline CSKH: 1900 6868 - Email hỗ trợ: support@tnacinema.com
        </p>

        <p>
          Copyright © 2026 TNA CINEMA. All rights reserved.
        </p>

      </div>

    </footer>
  );
}