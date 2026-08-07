import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Form, Input, message } from "antd";
import "./Profile.css";
import MemberCard from "./MemberCard";
import TicketHistory from "./TicketHistory";
import PointHistory from "./PointHistory";
import { getAuthUser, getToken, saveAuthUser } from "../../../services/authApi";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const currentUser = getAuthUser();
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.name || "");
    }
  }, []);

  // Update profile name
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      message.warning("Họ & Tên không được để trống!");
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.put("/api/users/profile", { name: name.trim() }, config);

      // Merge and save updated user back to localStorage
      const updatedUser = { ...user, name: res.data.name };
      saveAuthUser(updatedUser);
      setUser(updatedUser);

      message.success("Cập nhật thông tin cá nhân thành công!");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi khi cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };

  // Change password with current password verification
  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(
        "/api/users/profile",
        {
          currentPassword: values.currentPassword,
          password: values.newPassword,
        },
        config
      );

      message.success("Đổi mật khẩu thành công! Vui lòng nhớ mật khẩu mới của bạn.");
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        <h1 className="profile-title">Thông tin cá nhân</h1>

        <div className="tabs">
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Tài khoản của tôi
          </button>

          <button
            className={activeTab === "member" ? "active" : ""}
            onClick={() => setActiveTab("member")}
          >
            Thông tin thẻ thành viên
          </button>

          <button
            className={activeTab === "ticket" ? "active" : ""}
            onClick={() => setActiveTab("ticket")}
          >
            Lịch sử mua vé
          </button>

          <button
            className={activeTab === "point" ? "active" : ""}
            onClick={() => setActiveTab("point")}
          >
            Lịch sử điểm thưởng
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="profile-card">
            <div className="row">
              <div className="form-group">
                <label>Họ & Tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                />
              </div>

              <div className="form-group">
                <label>Email (Không thể thay đổi)</label>
                <input
                  type="email"
                  value={user?.email || "Chưa cập nhật"}
                  readOnly
                  style={{ opacity: 0.7, cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label>Vai trò</label>
                <input
                  type="text"
                  value={user?.role === "admin" ? "Quản trị viên (Admin)" : "Thành viên (Customer)"}
                  readOnly
                  style={{ opacity: 0.7, cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group">
                <label>Mã tài khoản</label>
                <input
                  type="text"
                  value={user?._id || "N/A"}
                  readOnly
                  style={{ opacity: 0.7, cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div className="actions">
              <button
                className="password-btn"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                🔒 Đổi mật khẩu
              </button>

              <button
                className="save-btn"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "💾 Lưu thông tin"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "member" && <MemberCard />}

        {activeTab === "ticket" && <TicketHistory />}

        {activeTab === "point" && <PointHistory />}

      </div>

      {/* Modal Đổi mật khẩu */}
      <Modal
        title="🔒 ĐỔI MẬT KHẨU TÀI KHOẢN"
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={480}
      >
        <Form
          layout="vertical"
          form={passwordForm}
          onFinish={handleChangePassword}
          style={{ marginTop: 15 }}
          autoComplete="off"
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại..." size="large" autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu mới phải từ 6 ký tự trở lên!" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới..." size="large" autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới..." size="large" autoComplete="off" />
          </Form.Item>

          <button
            type="submit"
            className="save-btn"
            style={{ width: "100%", marginTop: 15, padding: "12px 0" }}
          >
            Lưu Mật Khẩu Mới
          </button>
        </Form>
      </Modal>
    </div>
  );
}