import { useState } from "react";
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

interface Booking {
  id: number;
  code: string;
  customer: string;
  movie: string;
  showtime: string;
  seats: string;
  total: number;
  status: string;
}

const data: Booking[] = [
  {
    id: 1,
    code: "BK001",
    customer: "Nguyễn Văn A",
    movie: "Avengers",
    showtime: "20:00 - 10/07/2026",
    seats: "A1, A2",
    total: 180000,
    status: "Đã thanh toán",
  },
  {
    id: 2,
    code: "BK002",
    customer: "Trần Thị B",
    movie: "Conan",
    showtime: "18:30 - 11/07/2026",
    seats: "B5",
    total: 90000,
    status: "Chờ thanh toán",
  },
];

export default function BookingList() {
  const [bookings, setBookings] = useState(data);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Booking | null>(null);

  const cancelBooking = (id: number) => {
    setBookings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Đã hủy" } : item
      )
    );

    message.success("Hủy vé thành công");
  };

  const columns = [
    {
      title: "Mã vé",
      dataIndex: "code",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
    },
    {
      title: "Phim",
      dataIndex: "movie",
    },
    {
      title: "Suất chiếu",
      dataIndex: "showtime",
    },
    {
      title: "Ghế",
      dataIndex: "seats",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      render: (value: number) => value.toLocaleString() + " đ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Đã thanh toán"
              ? "green"
              : status === "Đã hủy"
              ? "red"
              : "orange"
          }
        >
          {status}
        </Tag>
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

          {record.status !== "Đã hủy" && (
            <Popconfirm
              title="Bạn muốn hủy vé?"
              onConfirm={() => cancelBooking(record.id)}
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
      item.customer.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card title="Quản lý vé">
      <Input
        placeholder="Tìm theo mã vé hoặc khách hàng..."
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
        open={!!detail}
        footer={null}
        title="Chi tiết vé"
        onCancel={() => setDetail(null)}
      >
        {detail && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã vé">
              {detail.code}
            </Descriptions.Item>

            <Descriptions.Item label="Khách hàng">
              {detail.customer}
            </Descriptions.Item>

            <Descriptions.Item label="Phim">
              {detail.movie}
            </Descriptions.Item>

            <Descriptions.Item label="Suất chiếu">
              {detail.showtime}
            </Descriptions.Item>

            <Descriptions.Item label="Ghế">
              {detail.seats}
            </Descriptions.Item>

            <Descriptions.Item label="Tổng tiền">
              {detail.total.toLocaleString()} đ
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {detail.status}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
}