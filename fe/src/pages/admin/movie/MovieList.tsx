import { useEffect, useState } from "react";
import { Table, Button, Card, Tag, Space, Popconfirm, message, Input, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, VideoCameraOutlined, SearchOutlined } from "@ant-design/icons";
import { deleteMovie, getMovies } from "../../../services/movie.service";
import { Movie } from "../../../types/Movie";
import { useNavigate } from "react-router-dom";

const MovieList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
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

  // Lọc danh sách phim theo Tên, Thể loại và Trạng thái
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchText.toLowerCase());
    
    const movieGenres = movie.genres && movie.genres.length > 0 
      ? movie.genres 
      : (movie.genre ? movie.genre.split(',').map(g => g.trim()) : []);

    const matchesGenre = selectedGenre === "all" || movieGenres.includes(selectedGenre);

    const matchesStatus = selectedStatus === "all" || movie.status === selectedStatus;

    return matchesSearch && matchesGenre && matchesStatus;
  });

  const columns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Poster",
      dataIndex: "poster",
      key: "poster",
      width: 80,
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
      title: "Tên Phim & Định Dạng",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: Movie) => (
        <div>
          <strong style={{ fontSize: "15px", color: "#1f2937", display: "block" }}>{title}</strong>
          <Space style={{ marginTop: 4 }}>
            <Tag color="volcano" style={{ fontWeight: 600 }}>{record.format || '2D'}</Tag>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>{record.language}</span>
          </Space>
        </div>
      ),
    },
    {
      title: "Thể Loại",
      key: "genre",
      render: (_: any, record: Movie) => {
        const list = record.genres && record.genres.length > 0 
          ? record.genres 
          : (record.genre ? record.genre.split(',').map(g => g.trim()) : []);
        return (
          <Space wrap size={[0, 4]}>
            {list.map((g) => (
              <Tag key={g} color="blue" style={{ fontSize: "12px" }}>
                {g}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === 'coming_soon') {
          return <Tag color="gold" style={{ fontWeight: 600 }}>🟡 Sắp Chiếu</Tag>;
        }
        if (status === 'ended') {
          return <Tag color="default" style={{ fontWeight: 600 }}>🔴 Đã Ngừng</Tag>;
        }
        return <Tag color="green" style={{ fontWeight: 600 }}>🟢 Đang Chiếu</Tag>;
      },
    },
    {
      title: "Thời Lượng",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (duration: number) => (
        <Tag color="purple" style={{ fontSize: "13px" }}>
          {duration} phút
        </Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 170,
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
              Quản Lý Danh Sách Phim
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
        {/* Bộ lọc và tìm kiếm */}
        <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }} wrap>
          <Space wrap>
            <Input
              placeholder="Tìm kiếm theo tên phim..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 260 }}
              allowClear
            />

            <Select
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              style={{ width: 180 }}
            >
              <Select.Option value="all">Tất cả Trạng Thái</Select.Option>
              <Select.Option value="now_showing">🟢 Đang Chiếu</Select.Option>
              <Select.Option value="coming_soon">🟡 Sắp Chiếu</Select.Option>
              <Select.Option value="ended">🔴 Đã Ngừng Chiếu</Select.Option>
            </Select>

            <Select
              value={selectedGenre}
              onChange={(val) => setSelectedGenre(val)}
              style={{ width: 180 }}
            >
              <Select.Option value="all">Tất cả Thể Loại</Select.Option>
              <Select.Option value="Hành Động">Hành Động</Select.Option>
              <Select.Option value="Tình Cảm">Tình Cảm</Select.Option>
              <Select.Option value="Hài Hước">Hài Hước</Select.Option>
              <Select.Option value="Kinh Dị">Kinh Dị</Select.Option>
              <Select.Option value="Hoạt Hình">Hoạt Hình</Select.Option>
              <Select.Option value="Viễn Tưởng">Viễn Tưởng</Select.Option>
            </Select>
          </Space>

          <span style={{ color: "#6b7280", fontSize: 13 }}>
            Hiển thị: <strong>{filteredMovies.length}</strong> / {movies.length} phim
          </span>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredMovies}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default MovieList;
