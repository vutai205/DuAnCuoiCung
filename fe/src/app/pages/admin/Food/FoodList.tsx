import { useEffect, useState } from "react";
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
  Tag,
  Image,
  Upload,
  Segmented,
  Spin,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CoffeeOutlined,
  InboxOutlined,
  UploadOutlined,
  LinkOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { getToken } from "../../../../services/authApi";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [form] = Form.useForm();

  const loadFoods = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setFoods(res.data);
    } catch {
      message.error("Không thể tải danh sách đồ ăn & nước uống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const handleOpenAdd = () => {
    setEditing(null);
    setPreviewUrl("");
    setUploadMode("file");
    form.resetFields();
    form.setFieldsValue({
      category: "Bỏng ngô",
      quantity: 100,
      price: 50000,
    });
    setOpen(true);
  };

  const handleOpenEdit = (record: Food) => {
    setEditing(record);
    setPreviewUrl(record.image);
    setUploadMode(
      record.image && record.image.startsWith("http") && !record.image.includes("/uploads/")
        ? "url"
        : "file"
    );
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleCustomUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = getToken();
      const res = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const uploadedUrl = res.data.imageUrl;
      form.setFieldsValue({ image: uploadedUrl });
      setPreviewUrl(uploadedUrl);
      message.success("Đã tải hình ảnh từ máy tính lên thành công!");
    } catch (err: any) {
      // Fallback read as Base64 Data URL if server upload endpoint fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target?.result as string;
        form.setFieldsValue({ image: base64Url });
        setPreviewUrl(base64Url);
        message.success("Đã tải hình ảnh từ máy tính thành công!");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values: Food) => {
    if (!values.image) {
      message.error("Vui lòng chọn hình ảnh từ máy tính hoặc nhập URL!");
      return;
    }

    try {
      if (editing) {
        await axios.put(`${API}/${editing._id}`, values);
        message.success("Cập nhật đồ ăn thành công!");
      } else {
        await axios.post(API, values);
        message.success("Thêm đồ ăn mới thành công!");
      }

      setOpen(false);
      form.resetFields();
      setEditing(null);
      loadFoods();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu đồ ăn");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await axios.delete(`${API}/${id}`);
      message.success("Đã xóa đồ ăn thành công!");
      loadFoods();
    } catch {
      message.error("Không thể xóa sản phẩm này!");
    }
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 90,
      render: (img: string, record: Food) => (
        <Image
          src={img}
          alt={record.name}
          width={65}
          height={65}
          style={{ objectFit: "cover", borderRadius: "8px", border: "1px solid #f0f0f0" }}
          fallback="https://via.placeholder.com/65?text=No+Image"
        />
      ),
    },
    {
      title: "Tên Đồ Ăn & Nước Uống",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <strong style={{ fontSize: "15px", color: "#1f2937" }}>{text}</strong>
      ),
    },
    {
      title: "Danh Mục",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => (
        <Tag color="gold" style={{ fontSize: "13px", padding: "2px 8px" }}>
          {cat || "Đồ ăn vặt"}
        </Tag>
      ),
    },
    {
      title: "Đơn Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <Tag color="green" style={{ fontSize: "13px", padding: "2px 8px", fontWeight: "bold" }}>
          {price ? price.toLocaleString("vi-VN") : 0} đ
        </Tag>
      ),
    },
    {
      title: "Số Lượng Tồn Kho",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number) => (
        <Tag color={qty > 0 ? "blue" : "red"} style={{ fontSize: "13px", padding: "2px 8px" }}>
          {qty > 0 ? `${qty} phần` : "Hết hàng"}
        </Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 180,
      render: (_: any, record: Food) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa đồ ăn"
            description={`Bạn có chắc chắn muốn xóa "${record.name}" không?`}
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filtered = foods.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              <CoffeeOutlined style={{ color: "#e50914", marginRight: "8px" }} />
              Quản Lý Đồ Ăn & Nước Uống
            </span>
            <Button
              type="primary"
              danger
              icon={<PlusOutlined />}
              onClick={handleOpenAdd}
            >
              Thêm Đồ Ăn Mới
            </Button>
          </div>
        }
      >
        <Input
          placeholder="Tìm kiếm theo tên đồ ăn hoặc danh mục..."
          prefix={<SearchOutlined style={{ color: "#aaa" }} />}
          style={{ marginBottom: 20, maxWidth: "400px" }}
          size="large"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          pagination={{ pageSize: 8 }}
        />

        <Modal
          title={editing ? "✏️ Cập Nhật Đồ Ăn" : "➕ Thêm Đồ Ăn Mới"}
          open={open}
          onCancel={() => setOpen(false)}
          onOk={() => form.submit()}
          okText={editing ? "Cập nhật" : "Thêm mới"}
          cancelText="Hủy"
          width={560}
        >
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Tên Đồ Ăn / Nước Uống"
              rules={[
                { required: true, message: "Vui lòng nhập tên đồ ăn / nước uống!" },
                { min: 2, message: "Tên sản phẩm phải từ 2 ký tự trở lên!" },
              ]}
            >
              <Input placeholder="VD: Bỏng ngô Phô Mai Size L, Coca Cola..." size="large" />
            </Form.Item>

            <Form.Item label="Phương Thức Chọn Ảnh">
              <Segmented
                value={uploadMode}
                onChange={(value) => setUploadMode(value as "file" | "url")}
                options={[
                  { label: "💻 Chọn ảnh từ máy tính", value: "file", icon: <UploadOutlined /> },
                  { label: "🔗 Nhập URL trực tiếp", value: "url", icon: <LinkOutlined /> },
                ]}
                block
                style={{ marginBottom: "12px" }}
              />
            </Form.Item>

            {uploadMode === "file" ? (
              <Form.Item
                label="Tập Tin Hình Ảnh Từ Máy Tính *"
                help="Định dạng hỗ trợ: PNG, JPG, WEBP"
              >
                <Upload.Dragger
                  name="image"
                  multiple={false}
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={(file) => {
                    handleCustomUpload(file);
                    return false;
                  }}
                  style={{ padding: "16px", background: "#fafafa", borderRadius: "8px" }}
                >
                  {uploading ? (
                    <div style={{ padding: "20px 0" }}>
                      <Spin tip="Đang tải ảnh lên..." />
                    </div>
                  ) : previewUrl ? (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={previewUrl}
                        alt="Food Preview"
                        style={{
                          maxHeight: "130px",
                          maxWidth: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginBottom: "10px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      />
                      <div>
                        <Button icon={<UploadOutlined />}>Chọn / Thay đổi ảnh khác từ máy tính</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: "36px", color: "#1890ff" }} />
                      </p>
                      <p className="ant-upload-text" style={{ fontWeight: 600, fontSize: "15px" }}>
                        Bấm vào đây hoặc kéo thả ảnh từ máy tính vào đây
                      </p>
                      <p className="ant-upload-hint" style={{ color: "#888", fontSize: "13px" }}>
                        Chọn file hình ảnh đồ ăn từ thư mục máy tính của bạn
                      </p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>
            ) : (
              <Form.Item
                name="image"
                label="URL Hình Ảnh *"
                rules={[{ required: true, message: "Vui lòng nhập URL hình ảnh đồ ăn!" }]}
              >
                <Input
                  placeholder="https://images.unsplash.com/..."
                  size="large"
                  onChange={(e) => setPreviewUrl(e.target.value)}
                />
              </Form.Item>
            )}

            <Form.Item name="image" noStyle hidden>
              <Input />
            </Form.Item>

            <Form.Item
              name="category"
              label="Danh Mục Sản Phẩm"
              rules={[{ required: true, message: "Vui lòng chọn hoặc nhập danh mục!" }]}
            >
              <Select size="large" placeholder="Chọn hoặc nhập danh mục">
                <Select.Option value="Bỏng ngô">Bỏng ngô (Popcorn)</Select.Option>
                <Select.Option value="Nước ngọt">Nước giải khát / Nước ngọt</Select.Option>
                <Select.Option value="Combo Đồ Ăn">Combo Tiết Kiệm</Select.Option>
                <Select.Option value="Bánh snack">Snack / Đồ ăn nhẹ</Select.Option>
              </Select>
            </Form.Item>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Form.Item
                name="price"
                label="Đơn Giá (VNĐ)"
                rules={[
                  { required: true, message: "Vui lòng nhập giá tiền!" },
                  { type: "number", min: 500, message: "Giá tiền tối thiểu 500đ!" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  size="large"
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(val) => Number(val?.replace(/\,/g, "") || 0)}
                  placeholder="VD: 65,000"
                />
              </Form.Item>

              <Form.Item
                name="quantity"
                label="Số Lượng Tồn Kho"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng!" },
                  { type: "number", min: 0, message: "Số lượng từ 0 trở lên!" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  size="large"
                  min={0}
                  placeholder="VD: 100"
                />
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}