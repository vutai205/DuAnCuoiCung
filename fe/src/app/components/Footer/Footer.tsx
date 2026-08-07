import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-menu">

        <a href="/">Chính sách</a>
        <a href="/">Lịch chiếu</a>
        <a href="/">Tin tức</a>
        <a href="/">Giá vé</a>
        <a href="/">Hỏi đáp</a>
        <a href="/">Đặt vé nhóm</a>
        <a href="/">Liên hệ</a>

      </div>

      <div className="socials">
        <span>📘</span>
        <span>💬</span>
        <span>▶️</span>
      </div>

      <div className="footer-content">

        <p style={{ fontWeight: "bold", fontSize: "1.05rem", color: "#e50914" }}>
          VENRI CINEMA — Hệ Thống Rạp Chiếu Phim Đẳng Cấp
        </p>

        <p>
          Bản quyền thuộc Cụm Rạp VENRI CINEMA
        </p>

        <p>
          Địa chỉ: Số 87 Láng Hạ, Đống Đa, Hà Nội
        </p>

        <p>
          Hotline CSKH: 1900 6868 - Email hỗ trợ: support@venricinema.com
        </p>

        <p>
          Copyright © 2026 VENRI CINEMA. All rights reserved.
        </p>

      </div>

    </footer>
  );
}