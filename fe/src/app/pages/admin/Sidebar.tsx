import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: 250,
        minHeight: "100vh",
        background: "#001529",
        color: "#fff",
        padding: 20,
      }}
    >
      <h2 style={{ color: "#fff", marginBottom: 30 }}>ADMIN</h2>

      <ul style={{ listStyle: "none", padding: 0, lineHeight: "40px" }}>
        <li><Link to="/admin" style={{ color: "#fff" }}>Dashboard</Link></li>

        <li><Link to="/admin/movies" style={{ color: "#fff" }}>Quản lý phim</Link></li>

        <li><Link to="/admin/showtimes" style={{ color: "#fff" }}>Quản lý suất chiếu</Link></li>

        <li><Link to="/admin/bookings" style={{ color: "#fff" }}>Quản lý vé</Link></li>

        <li><Link to="/admin/customers" style={{ color: "#fff" }}>Quản lý khách hàng</Link></li>

        <li><Link to="/admin/foods" style={{ color: "#fff" }}>Đồ ăn & nước uống</Link></li>

        <li><Link to="/admin/users" style={{ color: "#fff" }}>Quản lý tài khoản</Link></li>
      </ul>
    </div>
  );
}