import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Input,
  Modal,
  Form,
  Table,
  Space,
  Tag,
  Popconfirm,
  message,
} from "antd";
import { getToken } from "../../../../services/authApi";

interface Customer {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: boolean;
  createdAt?: string;
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const [form] = Form.useForm();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get("/api/users", config);
      // Lọc ra các tài khoản khách hàng thực sự (role === 'user')
      const userList = res.data.filter((u: any) => u.role === "user" || !u.role);
      setCustomers(userList);
    } catch (err: any) {
      message.error("Không thể tải danh sách khách hàng từ CSDL");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (values: any) => {
    if (!editing) return;
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(`/api/users/${editing._id}`, { ...values, role: "user" }, config);
      message.success("Cập nhật thông tin khách hàng thành công");

      setOpen(false);
      form.resetFields();
      setEditing(null);
      fetchCustomers();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/users/status/${id}`, {}, config);
      message.success("Đã thay đổi trạng thái tài khoản thành công");
      fetchCustomers();
    } catch (err: any) {
      message.error("Lỗi thay đổi trạng thái");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/users/${id}`, config);
      message.success("Đã xóa khách hàng thành công");
      fetchCustomers();
    } catch (err: any) {
      message.error("Lỗi khi xóa khách hàng");
    }
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Email khách hàng",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Hạng Thành Viên",
      key: "rank",
      render: () => <Tag color="gold">THÀNH VIÊN SILVER</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <Tag color={status !== false ? "green" : "red"}>
          {status !== false ? "Hoạt động" : "Bị khóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Customer) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setEditing(record);
              form.setFieldsValue({
                name: record.name,
                email: record.email,
              });
              setOpen(true);
            }}
          >
            Sửa
          </Button>

          <Button
            size="small"
            onClick={() => handleToggleStatus(record._id)}
          >
            {record.status !== false ? "Khóa" : "Mở"}
          </Button>

          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tài khoản khách hàng này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger size="small">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filtered = customers.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card title="👤 Quản Lý Danh Sách Khách Hàng (Đăng Ký Online)">
      <Input
        placeholder="Tìm kiếm theo tên hoặc email khách hàng..."
        style={{ marginBottom: 20 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filtered}
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title="✏️ Cập nhật thông tin khách hàng"
        open={open}
        footer={null}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input autoComplete="off" />
          </Form.Item>

          <Button htmlType="submit" block type="primary" style={{ marginTop: 10 }}>
            Lưu Cập Nhật
          </Button>
        </Form>
      </Modal>
    </Card>
  );
}