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
  FaTags,
  FaStar,
  FaEnvelope
} from "react-icons/fa";
import { getAuthUser } from "../../services/authApi";

const Sidebar = () => {
  const user = getAuthUser();
  const isStaff = user?.role === 'staff';

  const allMenus = [
    {
      title: "Tổng Quan",
      icon: <FaChartBar />,
      path: "/admin",
      roles: ["admin", "staff"]
    },
    {
      title: "Quản Lý Phim",
      icon: <FaFilm />,
      path: "/admin/movies",
      roles: ["admin"]
    },
    {
      title: "Banner Quảng Cáo",
      icon: <FaImages />,
      path: "/admin/banner",
      roles: ["admin"]
    },
    {
      title: "Phòng Chiếu",
      icon: <FaDoorOpen />,
      path: "/admin/rooms",
      roles: ["admin"]
    },
    {
      title: "Suất Chiếu",
      icon: <FaClock />,
      path: "/admin/showtimes",
      roles: ["admin"]
    },
    {
      title: "Quản Lý Đơn Vé & Soát Vé",
      icon: <FaTicketAlt />,
      path: "/admin/bookings",
      roles: ["admin", "staff"]
    },
    {
      title: "Đồ Ăn & Nước Uống",
      icon: <FaUtensils />,
      path: "/admin/foods",
      roles: ["admin"]
    },
    {
      title: "Quản Lý Voucher",
      icon: <FaTags />,
      path: "/admin/vouchers",
      roles: ["admin"]
    },
    {
      title: "Quản Lý Đánh Giá",
      icon: <FaStar />,
      path: "/admin/reviews",
      roles: ["admin"]
    },
    {
      title: "Quản Lý Liên Hệ & Phản Hồi",
      icon: <FaEnvelope />,
      path: "/admin/contacts",
      roles: ["admin"]
    },
    {
      title: "Quản Lý Tài Khoản & Khách Hàng",
      icon: <FaUsers />,
      path: "/admin/users",
      roles: ["admin"]
    }
  ];

  // Nếu là Staff, chỉ giữ lại Tổng Quan và Quản Lý Đơn Vé & Soát Vé
  const menus = allMenus.filter(item => item.roles.includes(user?.role || "admin"));

  return (
    <aside className="sidebar">
      <div className="logo" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span>🎬 TNA CINEMA</span>
        <span style={{ fontSize: '12px', opacity: 0.8, color: isStaff ? '#38bdf8' : '#fbbf24' }}>
          {isStaff ? '🎫 Trang Nhân Viên' : '👑 Trang Quản Trị'}
        </span>
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
