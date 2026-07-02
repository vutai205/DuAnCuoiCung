import { FaBell, FaUserCircle } from "react-icons/fa";

const Header = () => {
  return (
    <header className="admin-header">
      <div>
        <h2>Admin Dashboard</h2>
        <p>Welcome back 👋</p>
      </div>

      <div className="header-right">
        <FaBell className="icon" />

        <div className="admin-user">
          <FaUserCircle size={35} />
          <div>
            <strong>Admin</strong>
            <p>Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
