import { NavLink } from "react-router-dom";
import {
  FaFilm,
  FaUsers,
  FaTicketAlt,
  FaDoorOpen,
  FaImages,
  FaChartBar,
  FaClock
} from "react-icons/fa";

const Sidebar = () => {
  const menus = [
    {
      title: "Dashboard",
      icon: <FaChartBar />,
      path: "/admin"
    },
    {
      title: "Movies",
      icon: <FaFilm />,
      path: "/admin/movies"
    },
    {
      title: "Banner",
      icon: <FaImages />,
      path: "/admin/banner"
    },
    {
      title: "Rooms",
      icon: <FaDoorOpen />,
      path: "/admin/rooms"
    },
    {
      title: "Showtimes",
      icon: <FaClock />,
      path: "/admin/showtimes"
    },
    {
      title: "Users",
      icon: <FaUsers />,
      path: "/admin/users"
    },
    {
      title: "Bookings",
      icon: <FaTicketAlt />,
      path: "/admin/bookings"
    }
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        🎬 Admin Panel
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
