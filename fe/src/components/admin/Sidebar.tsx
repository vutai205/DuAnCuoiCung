import { NavLink } from "react-router-dom";
import {
  FaFilm,
  FaUsers,
  FaTicketAlt,
  FaDoorOpen,
  FaImages,
  FaChartBar,
  FaClock,
  FaUtensils,
  FaUserFriends
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
      title: "Tài Khoản Hệ Thống",
      icon: <FaUsers />,
      path: "/admin/users"
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
      title: "Danh Sách Khách Hàng",
      icon: <FaUserFriends />,
      path: "/admin/customers"
    }
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        🎬 Quản Trị Hệ Thống
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
