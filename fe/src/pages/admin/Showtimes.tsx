import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Select, DatePicker, InputNumber, Popconfirm, message, Tag, Space, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getToken } from '../../services/authApi';

interface ShowtimeItem {
  _id: string;
  movie: { _id: string; title: string; duration: number } | string;
  room: { _id: string; name: string } | string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
}

const Showtimes: React.FC = () => {
  const [showtimes, setShowtimes] = useState<ShowtimeItem[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingShowtime, setEditingShowtime] = useState<ShowtimeItem | null>(null);
  const [form] = Form.useForm();

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/showtimes');
      setShowtimes(res.data);
    } catch (err: any) {
      message.error('Không thể tải danh sách suất chiếu');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoviesAndRooms = async () => {
    try {
      const [movieRes, roomRes] = await Promise.all([
        axios.get('/api/movies'),
        axios.get('/api/rooms')
      ]);
      setMovies(movieRes.data);
      setRooms(roomRes.data);
    } catch (err) {
      console.error('Lỗi lấy dữ liệu phim/phòng:', err);
    }
  };

  useEffect(() => {
    fetchShowtimes();
    fetchMoviesAndRooms();
  }, []);

  const handleOpenAddModal = () => {
    setEditingShowtime(null);
    form.resetFields();
    form.setFieldsValue({ ticketPrice: 90000 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: ShowtimeItem) => {
    setEditingShowtime(record);
    const movieId = typeof record.movie === 'object' ? record.movie._id : record.movie;
    const roomId = typeof record.room === 'object' ? record.room._id : record.room;

    form.setFieldsValue({
      movie: movieId,
      room: roomId,
      startTime: dayjs(record.startTime),
      ticketPrice: record.ticketPrice
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getToken();
      await axios.delete(`/api/showtimes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đã xóa suất chiếu thành công');
      fetchShowtimes();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa suất chiếu');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const selectedMovie = movies.find(m => m._id === values.movie);
      const duration = selectedMovie ? selectedMovie.duration || 120 : 120;
      
      const startTime = values.startTime.toDate();
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      const payload = {
        movie: values.movie,
        room: values.room,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        ticketPrice: values.ticketPrice
      };

      if (editingShowtime) {
        await axios.put(`/api/showtimes/${editingShowtime._id}`, payload, config);
        message.success('Cập nhật suất chiếu thành công');
      } else {
        await axios.post('/api/showtimes', payload, config);
        message.success('Tạo suất chiếu mới thành công');
      }
      setIsModalOpen(false);
      fetchShowtimes();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi xử lý suất chiếu');
    }
  };

  const columns = [
    {
      title: 'Tên Phim',
      key: 'movie',
      render: (_: any, record: ShowtimeItem) => {
        const title = typeof record.movie === 'object' ? record.movie.title : 'Chưa xác định';
        return <strong style={{ fontSize: '15px' }}>{title}</strong>;
      }
    },
    {
      title: 'Phòng Chiếu',
      key: 'room',
      render: (_: any, record: ShowtimeItem) => {
        const roomName = typeof record.room === 'object' ? record.room.name : 'Chưa xác định';
        return <Tag color="blue">{roomName}</Tag>;
      }
    },
    {
      title: 'Giờ Bắt Đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (dateStr: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#52c41a' }} />
          <span>{dayjs(dateStr).format('HH:mm - DD/MM/YYYY')}</span>
        </Space>
      )
    },
    {
      title: 'Giá Vé Base',
      dataIndex: 'ticketPrice',
      key: 'ticketPrice',
      render: (price: number) => (
        <Tag color="red" style={{ fontWeight: 'bold' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
        </Tag>
      )
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_: any, record: ShowtimeItem) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa suất chiếu"
            description="Bạn có chắc muốn xóa suất chiếu này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><ClockCircleOutlined /> Quản Lý Suất Chiếu</span>
            <Button type="primary" danger icon={<PlusOutlined />} onClick={handleOpenAddModal}>
              Tạo Suất Chiếu Mới
            </Button>
          </div>
        }
      >
        <Table 
          columns={columns} 
          dataSource={showtimes} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingShowtime ? 'Chỉnh Sửa Suất Chiếu' : 'Tạo Suất Chiếu Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingShowtime ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="movie"
            label="Chọn Phim"
            rules={[{ required: true, message: 'Vui lòng chọn phim!' }]}
          >
            <Select placeholder="Chọn bộ phim chiếu">
              {movies.map(m => (
                <Select.Option key={m._id} value={m._id}>
                  {m.title} ({m.duration} phút)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="room"
            label="Chọn Phòng Chiếu"
            rules={[{ required: true, message: 'Vui lòng chọn phòng chiếu!' }]}
          >
            <Select placeholder="Chọn phòng chiếu">
              {rooms.map(r => (
                <Select.Option key={r._id} value={r._id}>
                  {r.name} ({r.totalSeats} ghế)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startTime"
            label="Thời Gian Bắt Đầu"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="ticketPrice"
            label="Giá Vé (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập giá vé!' }]}
          >
            <InputNumber
              min={10000}
              step={5000}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Showtimes;
