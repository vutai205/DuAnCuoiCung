import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  Descriptions,
  Popconfirm,
  message,
} from "antd";
import axios from "axios";

interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  showtime: {
    _id: string;
    movie: {
      _id: string;
      title: string;
    } | null;
    room: {
      _id: string;
      name: string;
    } | null;
    startTime: string;
  } | null;
  seats: string[];
  totalPrice: number;
  status: string;
  paymentStatus: string;
  isCheckedIn: boolean;
  createdAt: string;
}

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Booking | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user") || "{}").token;
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/bookings", getHeaders());
      setBookings(res.data);
    } catch {
      message.error("Không lấy được danh sách vé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (id: string) => {
    try {
      await axios.put(`/api/bookings/${id}/status`, { status: "cancelled" }, getHeaders());
      message.success("Hủy vé thành công");
      loadBookings();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra khi hủy vé");
    }
  };

  const handleCheckin = async (id: string) => {
    try {
      await axios.put(`/api/bookings/${id}/checkin`, {}, getHeaders());
      message.success("Check-in vé thành công");
      loadBookings();
      if (detail && detail._id === id) {
        setDetail((prev) => prev ? { ...prev, isCheckedIn: true, status: "confirmed", paymentStatus: "paid" } : null);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra khi check-in");
    }
  };

  const columns = [
    {
      title: "Mã vé",
      dataIndex: "_id",
      render: (id: string) => <code style={{ fontWeight: "bold" }}>{id.substring(id.length - 8).toUpperCase()}</code>,
    },
    {
      title: "Khách hàng",
      render: (_: any, record: Booking) => record.user?.name || record.user?.email || "Khách vãng lai",
    },
    {
      title: "Phim",
      render: (_: any, record: Booking) => record.showtime?.movie?.title || "N/A",
    },
    {
      title: "Suất chiếu",
      render: (_: any, record: Booking) => {
        if (!record.showtime?.startTime) return "N/A";
        return new Date(record.showtime.startTime).toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      title: "Ghế",
      dataIndex: "seats",
      render: (seats: string[]) => seats?.join(", "),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      render: (value: number) => value ? value.toLocaleString() + " đ" : "0 đ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string, record: Booking) => (
        <Space direction="vertical" size="small">
          <Tag
            color={
              status === "confirmed"
                ? "green"
                : status === "cancelled"
                ? "red"
                : "orange"
            }
          >
            {status === "confirmed" ? "Thành công" : status === "cancelled" ? "Đã hủy" : "Chờ xử lý"}
          </Tag>
          <Tag color={record.isCheckedIn ? "cyan" : "blue"}>
            {record.isCheckedIn ? "Đã Check-in" : "Chưa Check-in"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      render: (_: any, record: Booking) => (
        <Space>
          <Button
            type="primary"
            onClick={() => setDetail(record)}
          >
            Chi tiết
          </Button>

          {!record.isCheckedIn && record.status !== "cancelled" && (
            <Popconfirm
              title="Xác nhận check-in vé này cho khách hàng?"
              onConfirm={() => handleCheckin(record._id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button type="default" style={{ backgroundColor: "#52c41a", color: "#fff", borderColor: "#52c41a" }}>
                Check-in
              </Button>
            </Popconfirm>
          )}

          {record.status !== "cancelled" && (
            <Popconfirm
              title="Bạn muốn hủy vé?"
              onConfirm={() => cancelBooking(record._id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button danger>Hủy</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const filtered = bookings.filter(
    (item) =>
      item._id.toLowerCase().includes(search.toLowerCase()) ||
      (item.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.showtime?.movie?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card title="Quản lý vé & Check-in tại rạp">
      <Input
        placeholder="Tìm theo mã vé, tên phim hoặc tên khách hàng..."
        style={{ marginBottom: 20 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filtered}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        open={!!detail}
        footer={null}
        title="Chi tiết vé"
        onCancel={() => setDetail(null)}
      >
        {detail && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã vé">
              <code style={{ fontWeight: "bold" }}>{detail._id.toUpperCase()}</code>
            </Descriptions.Item>

            <Descriptions.Item label="Khách hàng">
              {detail.user?.name ? `${detail.user.name} (${detail.user.email})` : detail.user?.email || "Khách vãng lai"}
            </Descriptions.Item>

            <Descriptions.Item label="Phim">
              {detail.showtime?.movie?.title || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Phòng chiếu">
              {detail.showtime?.room?.name || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Suất chiếu">
              {detail.showtime?.startTime
                ? new Date(detail.showtime.startTime).toLocaleString("vi-VN")
                : "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Ghế">
              {detail.seats?.join(", ")}
            </Descriptions.Item>

            <Descriptions.Item label="Tổng tiền">
              {detail.totalPrice?.toLocaleString()} đ
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  detail.status === "confirmed"
                    ? "green"
                    : detail.status === "cancelled"
                    ? "red"
                    : "orange"
                }
              >
                {detail.status === "confirmed" ? "Thành công" : detail.status === "cancelled" ? "Đã hủy" : "Chờ xử lý"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái check-in">
              <Tag color={detail.isCheckedIn ? "cyan" : "blue"}>
                {detail.isCheckedIn ? "Đã Check-in" : "Chưa Check-in"}
              </Tag>
              {!detail.isCheckedIn && detail.status !== "cancelled" && (
                <Button 
                  type="primary" 
                  size="small" 
                  style={{ marginLeft: 10, backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                  onClick={() => handleCheckin(detail._id)}
                >
                  Check-in ngay
                </Button>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
}