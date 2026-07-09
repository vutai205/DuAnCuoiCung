import { useState } from "react";
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

interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  rank: string;
  status: string;
}

const initialData: Customer[] = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "vana@gmail.com",
    phone: "0988888888",
    rank: "Gold",
    status: "Hoạt động",
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "tranb@gmail.com",
    phone: "0912345678",
    rank: "Silver",
    status: "Khóa",
  },
];

export default function CustomerList() {
  const [customers, setCustomers] = useState(initialData);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    if (editing) {
      setCustomers((prev) =>
        prev.map((item) =>
          item.id === editing.id ? { ...editing, ...values } : item
        )
      );
      message.success("Cập nhật thành công");
    } else {
      setCustomers([
        ...customers,
        {
          id: Date.now(),
          ...values,
        },
      ]);
      message.success("Thêm thành công");
    }

    setOpen(false);
    form.resetFields();
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    setCustomers(customers.filter((item) => item.id !== id));
    message.success("Đã xóa");
  };

  const columns = [
    {
      title: "Họ tên",
      dataIndex: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
    },
    {
      title: "Hạng",
      dataIndex: "rank",
      render: (rank: string) => <Tag color="gold">{rank}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "Hoạt động" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      render: (_: any, record: Customer) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setEditing(record);
              form.setFieldsValue(record);
              setOpen(true);
            }}
          >
            Sửa
          </Button>

          <Button
            onClick={() => {
              setCustomers((prev) =>
                prev.map((item) =>
                  item.id === record.id
                    ? {
                        ...item,
                        status:
                          item.status === "Hoạt động"
                            ? "Khóa"
                            : "Hoạt động",
                      }
                    : item
                )
              );
            }}
          >
            {record.status === "Hoạt động" ? "Khóa" : "Mở"}
          </Button>

          <Popconfirm
            title="Xóa khách hàng?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filtered = customers.filter((item) =>
    item.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card
      title="Quản lý khách hàng"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          Thêm khách hàng
        </Button>
      }
    >
      <Input
        placeholder="Tìm khách hàng..."
        style={{ marginBottom: 20 }}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editing ? "Cập nhật khách hàng" : "Thêm khách hàng"}
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Hạng"
            name="rank"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Button htmlType="submit" block type="primary">
            {editing ? "Cập nhật" : "Thêm"}
          </Button>
        </Form>
      </Modal>
    </Card>
  );
}