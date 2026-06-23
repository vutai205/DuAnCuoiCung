import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#222",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>ADMIN</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>
          <Link to="/admin" style={{ color: "white" }}>
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/admin/movies" style={{ color: "white" }}>
            Quản lý phim
          </Link>
        </li>

        <li>
          <Link to="/admin/showtimes" style={{ color: "white" }}>
            Quản lý suất chiếu
          </Link>
        </li>

        <li>
          <Link to="/admin/bookings" style={{ color: "white" }}>
            Quản lý vé
          </Link>
        </li>

        <li>
          <Link to="/admin/users" style={{ color: "white" }}>
            Quản lý người dùng
          </Link>
        </li>
      </ul>
    </div>
  );
}