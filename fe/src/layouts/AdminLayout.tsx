import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";
import "./admin.css";

const AdminLayout = () => {
  return (
    <div className="admin">
      <Sidebar />

      <div className="admin-right">
        <Header />

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
