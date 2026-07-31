import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";
import { getAuthUser } from "../services/authApi";
import "./admin.css";

const AdminLayout = () => {
  const user = getAuthUser();

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

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
