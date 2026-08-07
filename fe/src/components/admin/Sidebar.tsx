import { NavLink } from "react-router-dom";
import {
  FaFilm,
  FaUsers,
  FaTicketAlt,
  FaDoorOpen,
  FaImages,
  FaChartBar,
  FaClock,
  FaUtensils
} from "react-icons/fa";

const Sidebar = () => {
  const menus = [
    {
      title: "Tổng Quan",
      icon: <FaChartBar />,
      path: "/admin"
    },
    {
      title: "Quản Lý Phim",
      icon: <FaFilm />,
      path: "/admin/movies"
    },
    {
      title: "Banner Quảng Cáo",
      icon: <FaImages />,
      path: "/admin/banner"
    },
    {
      title: "Phòng Chiếu",
      icon: <FaDoorOpen />,
      path: "/admin/rooms"
    },
    {
      title: "Suất Chiếu",
      icon: <FaClock />,
      path: "/admin/showtimes"
    },
    {
      title: "Quản Lý Đơn Vé",
      icon: <FaTicketAlt />,
      path: "/admin/bookings"
    },
    {
      title: "Đồ Ăn & Nước Uống",
      icon: <FaUtensils />,
      path: "/admin/foods"
    },
    {
      title: "Quản Lý Tài Khoản & Khách Hàng",
      icon: <FaUsers />,
      path: "/admin/users"
    }
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        🎬 Quản Trị VENRI CINEMA
      </div>

      <ul>
        {menus.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
