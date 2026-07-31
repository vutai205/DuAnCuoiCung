import {
  Button,
  Card,
  Image,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const data = [
  {
    _id: "1",
    poster: "https://picsum.photos/100/150",
    title: "Doraemon",
    genre: "Hoạt hình",
    duration: 120,
    releaseDate: "2026-06-10",
    status: "showing",
  },
  {
    _id: "2",
    poster: "https://picsum.photos/100/151",
    title: "Conan",
    genre: "Trinh thám",
    duration: 115,
    releaseDate: "2026-07-01",
    status: "coming",
  },
];

export default function MovieList() {
  const [movies] = useState(data);

  const columns = [
    {
      title: "Poster",
      dataIndex: "poster",
      render: (poster: string) => (
        <Image
          width={70}
          height={100}
          src={poster}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Tên phim",
      dataIndex: "title",
    },
    {
      title: "Thể loại",
      dataIndex: "genre",
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      render: (value: number) => `${value} phút`,
    },
    {
      title: "Ngày khởi chiếu",
      dataIndex: "releaseDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => {
        switch (status) {
          case "showing":
            return <Tag color="green">Đang chiếu</Tag>;

          case "coming":
            return <Tag color="blue">Sắp chiếu</Tag>;

          default:
            return <Tag color="red">Ngừng chiếu</Tag>;
        }
      },
    },
    {
      title: "Thao tác",
      render: () => (
        <Space>
          <Button type="primary" icon={<EyeOutlined />} />

          <Button icon={<EditOutlined />} />

          <Popconfirm title="Xóa phim?">
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý phim"
      extra={
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm phim
        </Button>
      }
    >
      <Space style={{ marginBottom: 20 }}>
        <Input
          placeholder="Tìm tên phim..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
        />

        <Button>Tìm kiếm</Button>
      </Space>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={movies}
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
}