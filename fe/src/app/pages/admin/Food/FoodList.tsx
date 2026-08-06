import {
  Button,
  Card,
  Input,
  Modal,
  Form,
  Table,
  Space,
  Popconfirm,
  message,
  InputNumber,
} from "antd";
import { useEffect, useState } from "react";
import axios from "axios";

interface Food {
  _id?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
}

const API = "/api/foods";

export default function FoodList() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const [editing, setEditing] = useState<Food | null>(null);

  const [form] = Form.useForm();

  const loadFoods = async () => {
    try {
      const res = await axios.get(API);
      setFoods(res.data);
    } catch {
      message.error("Không lấy được dữ liệu");
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const handleSubmit = async (values: Food) => {
    try {
      if (editing) {
        await axios.put(`${API}/${editing._id}`, values);
        message.success("Cập nhật thành công");
      } else {
        await axios.post(API, values);
        message.success("Thêm thành công");
      }

      setOpen(false);

      form.resetFields();

      setEditing(null);

      loadFoods();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    await axios.delete(`${API}/${id}`);

    message.success("Đã xóa");

    loadFoods();
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      render: (img: string) => (
        <img
          src={img}
          width={80}
          height={80}
          style={{ objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Tên",
      dataIndex: "name",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (price: number) => price.toLocaleString() + " đ",
    },
    {
      title: "SL",
      dataIndex: "quantity",
    },
    {
      title: "Thao tác",
      render: (_: any, record: Food) => (
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

          <Popconfirm
            title="Xóa?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filtered = foods.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card
      title="Quản lý đồ ăn & nước uống"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);

            form.resetFields();

            setOpen(true);
          }}
        >
          Thêm mới
        </Button>
      }
    >
      <Input
        placeholder="Tìm kiếm..."
        style={{ marginBottom: 20 }}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editing ? "Cập nhật" : "Thêm đồ ăn"}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="image"
            label="Ảnh"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Button
            htmlType="submit"
            type="primary"
            block
          >
            {editing ? "Cập nhật" : "Thêm"}
          </Button>
        </Form>
      </Modal>
    </Card>
  );
}