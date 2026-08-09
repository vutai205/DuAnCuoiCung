import { useEffect, useState } from "react";
import { Table, Button, Card, Tag, Space, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { deleteMovie, getMovies } from "../../../services/movie.service";
import { Movie } from "../../../types/Movie";
import { useNavigate } from "react-router-dom";

const MovieList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const loadMovie = async () => {
    setLoading(true);
    try {
      const { data } = await getMovies();
      setMovies(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách phim!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovie();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteMovie(id);
      message.success(`Đã xóa phim "${title}" thành công`);
      loadMovie();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể xóa phim này!";
      message.error(msg);
    }
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Poster",
      dataIndex: "poster",
      key: "poster",
      width: 90,
      render: (poster: string, record: Movie) => (
        <img
          src={poster}
          alt={record.title}
          width={50}
          height={70}
          style={{ objectFit: "cover", borderRadius: "6px", border: "1px solid #f0f0f0" }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ),
    },
    {
      title: "Tên Phim",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <strong style={{ fontSize: "15px", color: "#1f2937" }}>{title}</strong>
      ),
    },
    {
      title: "Thể Loại",
      dataIndex: "genre",
      key: "genre",
      render: (genre: string) => (
        <Tag color="blue" style={{ fontSize: "13px", padding: "2px 8px" }}>
          {genre}
        </Tag>
      ),
    },
    {
      title: "Thời Lượng",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => (
        <Tag color="purple" style={{ fontSize: "13px", padding: "2px 8px" }}>
          {duration} phút
        </Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 180,
      render: (_: any, record: Movie) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/movies/edit/${record._id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa phim"
            description={`Bạn có chắc chắn muốn xóa phim "${record.title}" không?`}
            onConfirm={() => handleDelete(record._id!, record.title)}
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

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              <VideoCameraOutlined style={{ color: "#e50914", marginRight: "8px" }} />
              Quản Lý Phim
            </span>
            <Button
              type="primary"
              danger
              icon={<PlusOutlined />}
              onClick={() => navigate("/admin/movies/add")}
            >
              Thêm Phim Mới
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={movies}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default MovieList;
