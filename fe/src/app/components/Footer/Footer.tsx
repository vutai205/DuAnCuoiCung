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

        <p>
          Cơ quan chủ quản: BỘ VĂN HÓA, THỂ THAO VÀ DU LỊCH
        </p>

        <p>
          Bản quyền thuộc Trung tâm Chiếu phim Quốc gia
        </p>

        <p>
          Địa chỉ: 87 Láng Hạ, Ba Đình, Hà Nội
        </p>

        <p>
          Điện thoại: 024.35141791
        </p>

        <p>
          Copyright © 2026 Trung tâm Chiếu phim Quốc gia
        </p>

      </div>

    </footer>
  );
}