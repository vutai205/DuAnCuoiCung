import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, message, Tag, Space, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { getToken } from '../../services/authApi';

interface Room {
  _id: string;
  name: string;
  type?: string;
  totalSeats: number;
  seatLayout?: { seatName: string; type: string }[];
  createdAt?: string;
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách phòng chiếu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRoom(null);
    form.resetFields();
    form.setFieldsValue({ totalSeats: 80, type: '2D Standard' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    form.setFieldsValue({
      name: room.name,
      type: room.type || '2D Standard',
      totalSeats: room.totalSeats
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getToken();
      await axios.delete(`/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đã xóa phòng chiếu thành công');
      fetchRooms();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa phòng chiếu');
    }
  };

  const handleSubmit = async (values: { name: string; type: string; totalSeats: number }) => {
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingRoom) {
        await axios.put(`/api/rooms/${editingRoom._id}`, values, config);
        message.success('Cập nhật phòng chiếu thành công');
      } else {
        await axios.post('/api/rooms', values, config);
        message.success('Tạo phòng chiếu mới thành công');
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xử lý phòng chiếu');
    }
  };

  const columns = [
    {
      title: 'Tên Phòng chiếu',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <AppstoreOutlined style={{ color: '#e50914', fontSize: '18px' }} />
          <strong style={{ fontSize: '15px' }}>{text}</strong>
        </Space>
      )
    },
    {
      title: 'Tổng số ghế',
      dataIndex: 'totalSeats',
      key: 'totalSeats',
      render: (count: number) => <Tag color="blue" style={{ fontSize: '14px', padding: '4px 10px' }}>{count} Ghế</Tag>
    },
    {
      title: 'Định dạng rạp',
      key: 'format',
      render: (_: any, record: Room) => {
        const typeStr = record.type || (record.name.toUpperCase().includes('IMAX') ? 'IMAX 3D' : record.name.toUpperCase().includes('VIP') ? 'Phòng VIP' : '2D Standard');
        if (typeStr.includes('IMAX')) return <Tag color="purple">IMAX 3D</Tag>;
        if (typeStr.includes('VIP')) return <Tag color="gold">Phòng VIP</Tag>;
        if (typeStr.includes('4DX')) return <Tag color="cyan">4DX</Tag>;
        return <Tag color="green">{typeStr}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Room) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleOpenEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa phòng chiếu"
            description="Bạn có chắc chắn muốn xóa phòng chiếu này không?"
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
            <span><AppstoreOutlined /> Quản Lý Phòng Chiếu</span>
            <Button type="primary" danger icon={<PlusOutlined />} onClick={handleOpenAddModal}>
              Thêm Phòng Chiếu Mới
            </Button>
          </div>
        }
      >
        <Table 
          columns={columns} 
          dataSource={rooms} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingRoom ? 'Chỉnh Sửa Phòng Chiếu' : 'Thêm Phòng Chiếu Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingRoom ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên Phòng Chiếu"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng chiếu!' }]}
          >
            <Input placeholder="VD: Phòng chiếu 01 (IMAX 3D)" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Định Dạng / Loại Phòng Chiếu"
            rules={[{ required: true, message: 'Vui lòng chọn loại phòng chiếu!' }]}
          >
            <Select placeholder="Chọn định dạng rạp">
              <Select.Option value="2D Standard">2D Standard (Phòng Tiêu Chuẩn)</Select.Option>
              <Select.Option value="Phòng VIP">Phòng VIP (Ghế Da Cao Cấp)</Select.Option>
              <Select.Option value="IMAX 3D">IMAX 3D (Màn Hình Cực Đại)</Select.Option>
              <Select.Option value="4DX">4DX (Hiệu Ứng Rung Lắc / Gió / Nước)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="totalSeats"
            label="Tổng Số Ghế"
            rules={[{ required: true, message: 'Vui lòng nhập tổng số ghế!' }]}
          >
            <InputNumber min={10} max={300} style={{ width: '100%' }} placeholder="VD: 80" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Rooms;
