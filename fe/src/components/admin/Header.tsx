import { FaBell, FaUserCircle } from "react-icons/fa";

const Header = () => {
  return (
    <header className="admin-header">
      <div>
        <h2>Bảng Điều Khiển Quản Trị</h2>
        <p>Chào mừng bạn quay trở lại 👋</p>
      </div>

      <div className="header-right">
        <FaBell className="icon" />

        <div className="admin-user">
          <FaUserCircle size={35} />
          <div>
            <strong>Quản Trị Viên</strong>
            <p>Quản lý hệ thống</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
