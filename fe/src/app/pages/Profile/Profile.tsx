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
  const [phone, setPhone] = useState<string>("");
  const [gender, setGender] = useState<string>("Nam");
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const currentUser = getAuthUser();
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setGender(currentUser.gender || "Nam");
      setAddress(currentUser.address || "");
    }
  }, []);

  // Save profile changes (Name, Phone, Gender, Address)
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      message.warning("Họ & Tên không được để trống!");
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.put(
        "/api/users/profile",
        {
          name: name.trim(),
          phone: phone.trim(),
          gender: gender,
          address: address.trim(),
        },
        config
      );

      // Save updated user to localStorage and update state
      const updatedUser = {
        ...user,
        name: res.data.name,
        phone: res.data.phone,
        gender: res.data.gender,
        address: res.data.address,
      };
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
    if (values.currentPassword === values.newPassword) {
      message.error("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
      return;
    }

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
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại liên hệ..."
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label>Giới tính</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px 18px",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: "14px",
                    color: "white",
                    fontSize: "15px",
                  }}
                >
                  <option value="Nam" style={{ background: "#020617" }}>Nam</option>
                  <option value="Nữ" style={{ background: "#020617" }}>Nữ</option>
                  <option value="Khác" style={{ background: "#020617" }}>Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label>Địa chỉ liên hệ</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ của bạn..."
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label>Email (Không thể thay đổi)</label>
                <input
                  type="email"
                  value={user?.email || "Chưa cập nhật"}
                  readOnly
                  style={{ opacity: 0.7, cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group">
                <label>Vai trò</label>
                <input
                  type="text"
                  value={user?.role === "admin" ? "Quản trị viên (Admin)" : "Thành viên (Customer)"}
                  readOnly
                  style={{ opacity: 0.7, cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div className="row">
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