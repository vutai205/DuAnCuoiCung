import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Popconfirm,
  message,
  Space,
  Badge
} from "antd";
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

interface Voucher {
  _id: string;
  code: string;
  description: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export default function VoucherManager() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const getHeaders = () => {
    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user") || "{}").token;
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/vouchers", getHeaders());
      setVouchers(res.data);
    } catch {
      message.error("Không thể lấy danh sách Voucher!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleCreateVoucher = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        code: values.code.toUpperCase().trim(),
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
      };

      await axios.post("/api/vouchers", payload, getHeaders());
      message.success("Thêm mã Voucher mới thành công!");
      setModalOpen(false);
      form.resetFields();
      loadVouchers();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra khi tạo Voucher!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await axios.put(`/api/vouchers/${id}/toggle`, {}, getHeaders());
      message.success("Đã cập nhật trạng thái Voucher!");
      loadVouchers();
    } catch {
      message.error("Lỗi khi thay đổi trạng thái!");
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    try {
      await axios.delete(`/api/vouchers/${id}`, getHeaders());
      message.success("Đã xóa Voucher thành công!");
      loadVouchers();
    } catch {
      message.error("Lỗi khi xóa Voucher!");
    }
  };

  const columns = [
    {
      title: "Mã Voucher",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <Badge.Ribbon text="TNA PROMO" color="red">
          <Card size="small" style={{ width: 140, textAlign: "center", background: "#fffbe6", border: "1px dashed #ffe58f" }}>
            <code style={{ fontSize: "1rem", fontWeight: "bold", color: "#e50914" }}>{code}</code>
          </Card>
        </Badge.Ribbon>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => desc || "Không có mô tả",
    },
    {
      title: "Mức giảm giá",
      key: "discount",
      render: (_: any, record: Voucher) => (
        <strong style={{ color: "#52c41a", fontSize: "1.05rem" }}>
          {record.discountType === "fixed"
            ? `${record.discountValue.toLocaleString("vi-VN")} đ`
            : `${record.discountValue}% ${record.maxDiscount ? `(Tối đa ${record.maxDiscount.toLocaleString("vi-VN")}đ)` : ""}`}
        </strong>
      ),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderValue",
      key: "minOrderValue",
      render: (val: number) => (val > 0 ? `${val.toLocaleString("vi-VN")} đ` : "Không có"),
    },
    {
      title: "Lượt dùng",
      key: "usage",
      render: (_: any, record: Voucher) => (
        <span>
          <strong>{record.usedCount}</strong> / {record.usageLimit}
        </span>
      ),
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (date?: string) => {
        if (!date) return <Tag color="green">Vô thời hạn</Tag>;
        const isExpired = new Date(date) < new Date();
        return (
          <Tag color={isExpired ? "red" : "blue"}>
            {dayjs(date).format("DD/MM/YYYY HH:mm")} {isExpired && "(Hết hạn)"}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: Voucher) => {
        const isExpired = record.expiresAt && new Date(record.expiresAt) < new Date();
        if (isExpired) return <Tag color="default">Đã hết hạn</Tag>;
        return (
          <Tag color={isActive ? "success" : "error"} icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}>
            {isActive ? "Đang hoạt động" : "Tạm dừng"}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      render: (_: any, record: Voucher) => (
        <Space size="small">
          <Button
            size="small"
            type={record.isActive ? "default" : "primary"}
            onClick={() => handleToggleStatus(record._id)}
          >
            {record.isActive ? "Tạm dừng" : "Kích hoạt"}
          </Button>

          <Popconfirm
            title="⚠️ Xác nhận xóa Mã Voucher này?"
            onConfirm={() => handleDeleteVoucher(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="🎟️ Quản Lý Mã Giảm Giá / Voucher Khuyến Mãi"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Tạo Voucher Mới
        </Button>
      }
    >
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={vouchers}
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      {/* Modal Tạo Voucher Mới */}
      <Modal
        open={modalOpen}
        title="🎟️ THÊM MÃ VOUCHER KHUYẾN MÃI MỚI"
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateVoucher}
          initialValues={{
            discountType: "fixed",
            minOrderValue: 0,
            usageLimit: 100,
          }}
        >
          <Form.Item
            label="Mã Voucher (Viết hoa, không dấu)"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập Mã Voucher!" }]}
          >
            <Input placeholder="VD: TNA20K, U22VIP, SIEUGIAM50" style={{ textTransform: "uppercase" }} />
          </Form.Item>

          <Form.Item label="Mô tả ưu đãi" name="description">
            <Input placeholder="VD: Giảm 20.000đ cho đơn từ 100.000đ" />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item label="Loại giảm giá" name="discountType" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: "Cố định (Số tiền đ)", value: "fixed" },
                  { label: "Theo phần trăm (%)", value: "percent" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Giá trị giảm"
              name="discountValue"
              rules={[{ required: true, message: "Vui lòng nhập giá trị giảm!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                placeholder="VD: 20000 hoặc 10"
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item label="Đơn hàng tối thiểu (đ)" name="minOrderValue">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                placeholder="0 đ (Không bắt buộc)"
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>

            <Form.Item label="Lượt sử dụng tối đa" name="usageLimit">
              <InputNumber style={{ width: "100%" }} min={1} placeholder="Mặc định 100" />
            </Form.Item>
          </div>

          <Form.Item label="Hạn sử dụng (Để trống nếu Vô thời hạn)" name="expiresAt">
            <DatePicker showTime style={{ width: "100%" }} placeholder="Chọn ngày hết hạn" />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
            <Button onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Tạo Voucher
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
}
