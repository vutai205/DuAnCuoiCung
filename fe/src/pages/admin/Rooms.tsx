import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  message,
  Tag,
  Space,
  Card,
  Radio,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ToolOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { getToken } from '../../services/authApi';

interface SeatItem {
  seatName: string;
  type: 'regular' | 'vip' | 'couple' | 'maintenance' | string;
  status?: 'active' | 'maintenance' | string;
}

interface Room {
  _id: string;
  name: string;
  type?: string;
  status?: 'active' | 'maintenance' | string;
  totalSeats: number;
  rowsCount?: number;
  seatsPerRow?: number;
  seatLayout?: SeatItem[];
  showtimesCount?: number;
  bookingsCount?: number;
  hasActiveData?: boolean;
  createdAt?: string;
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();

  // Seat Editor Modal State
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState<boolean>(false);
  const [activeRoomForLayout, setActiveRoomForLayout] = useState<Room | null>(null);
  const [currentSeatLayout, setCurrentSeatLayout] = useState<SeatItem[]>([]);
  const [selectedBrush, setSelectedBrush] = useState<'regular' | 'vip' | 'couple' | 'maintenance'>('regular');
  const [isSavingLayout, setIsSavingLayout] = useState<boolean>(false);

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
    form.setFieldsValue({
      rowsCount: 8,
      seatsPerRow: 10,
      totalSeats: 80,
      type: '2D Standard'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    const rowsCount = room.rowsCount || 8;
    const seatsPerRow = room.seatsPerRow || 10;
    form.setFieldsValue({
      name: room.name,
      type: room.type || '2D Standard',
      status: (room as any).status || 'active',
      rowsCount,
      seatsPerRow,
      totalSeats: room.totalSeats || (rowsCount * seatsPerRow)
    });
    setIsModalOpen(true);
  };

  const handleOpenLayoutModal = (room: Room) => {
    setActiveRoomForLayout(room);
    setCurrentSeatLayout(JSON.parse(JSON.stringify(room.seatLayout || [])));
    setIsLayoutModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getToken();
      const res = await axios.delete(`/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success(res.data?.message || 'Đã xóa phòng chiếu thành công');
      fetchRooms();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa phòng chiếu', 6);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const calculatedTotal = (values.rowsCount || 8) * (values.seatsPerRow || 10);
      const payload = {
        ...values,
        totalSeats: calculatedTotal
      };

      if (editingRoom) {
        await axios.put(`/api/rooms/${editingRoom._id}`, payload, config);
        message.success('Cập nhật phòng chiếu thành công');
      } else {
        await axios.post('/api/rooms', payload, config);
        message.success('Tạo phòng chiếu mới thành công');
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xử lý phòng chiếu');
    }
  };

  // Generate layout preset on frontend based on selected room template
  const applyPresetTemplate = (presetType: string) => {
    let rows = activeRoomForLayout?.rowsCount || 8;
    let cols = activeRoomForLayout?.seatsPerRow || 10;

    if (presetType === 'imax') {
      rows = 10;
      cols = 12;
    } else if (presetType === '4dx') {
      rows = 6;
      cols = 8;
    } else if (presetType === 'sweetbox') {
      rows = 6;
      cols = 10;
    }

    const rowsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    const actualRows = Math.min(rows, rowsLetters.length);
    const newLayout: SeatItem[] = [];

    for (let i = 0; i < actualRows; i++) {
      let seatType = 'regular';
      if (presetType === 'sweetbox') {
        seatType = 'couple';
      } else if (presetType === 'vip') {
        seatType = i === actualRows - 1 && actualRows > 2 ? 'couple' : 'vip';
      } else if (presetType === 'imax') {
        if (i < 2) seatType = 'regular';
        else if (i === actualRows - 1 && actualRows > 3) seatType = 'couple';
        else seatType = 'vip';
      } else if (presetType === '4dx') {
        if (i < 1) seatType = 'regular';
        else if (i === actualRows - 1 && actualRows > 3) seatType = 'couple';
        else seatType = 'vip';
      } else {
        // 2D Standard
        if (i >= 2 && i < actualRows - 1) seatType = 'vip';
        if (i === actualRows - 1 && actualRows > 3) seatType = 'couple';
      }

      for (let j = 1; j <= cols; j++) {
        newLayout.push({
          seatName: `${rowsLetters[i]}${j}`,
          type: seatType,
          status: 'active'
        });
      }
    }

    setCurrentSeatLayout(newLayout);
    message.success(`⚡ Đã áp dụng sơ đồ ghế mẫu: ${presetType.toUpperCase()}! Bạn có thể tùy chỉnh lại từng ghế trước khi Lưu.`);
  };

  const handleSeatClick = (seatName: string) => {
    setCurrentSeatLayout(prev =>
      prev.map(s => {
        if (s.seatName === seatName) {
          const newType = selectedBrush;
          const newStatus = selectedBrush === 'maintenance' ? 'maintenance' : 'active';
          return {
            ...s,
            type: newType,
            status: newStatus
          };
        }
        return s;
      })
    );
  };

  const handleSetRowType = (rowLetter: string, targetType: 'regular' | 'vip' | 'couple' | 'maintenance') => {
    setCurrentSeatLayout(prev =>
      prev.map(s => {
        if (s.seatName.startsWith(rowLetter)) {
          return {
            ...s,
            type: targetType,
            status: targetType === 'maintenance' ? 'maintenance' : 'active'
          };
        }
        return s;
      })
    );
    message.info(`Đã đổi toàn bộ Hàng ${rowLetter} sang loại: ${getSeatTypeName(targetType)}`);
  };

  const handleSaveSeatLayout = async () => {
    if (!activeRoomForLayout) return;
    setIsSavingLayout(true);
    try {
      const token = getToken();
      await axios.put(
        `/api/rooms/${activeRoomForLayout._id}`,
        { seatLayout: currentSeatLayout },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Đã lưu sơ đồ ghế & cập nhật trạng thái bảo trì thành công!');
      setIsLayoutModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể lưu sơ đồ ghế');
    } finally {
      setIsSavingLayout(false);
    }
  };

  const getSeatTypeName = (typeStr: string) => {
    if (typeStr === 'maintenance') return '🛠️ Bảo trì / Khóa';
    if (typeStr === 'vip') return '⭐ VIP';
    if (typeStr === 'couple') return '💕 Đôi (Couple)';
    return '🟢 Thường';
  };

  // Group current seat layout by rows for rendering visual seat map
  const layoutRowsMap: { [row: string]: SeatItem[] } = {};
  currentSeatLayout.forEach(s => {
    const match = s.seatName.match(/^([A-Z]+)(\d+)$/);
    const rowLetter = match ? match[1] : 'A';
    if (!layoutRowsMap[rowLetter]) layoutRowsMap[rowLetter] = [];
    layoutRowsMap[rowLetter].push(s);
  });
  const rowLettersList = Object.keys(layoutRowsMap).sort();

  // Dynamic Add / Remove Rows & Columns
  const handleAddRow = () => {
    const rowsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    const currentRowsCount = rowLettersList.length;
    if (currentRowsCount >= rowsLetters.length) {
      message.warning('Đã đạt giới hạn tối đa 16 hàng ghế (A-P)!');
      return;
    }
    const nextRowLetter = rowsLetters[currentRowsCount];
    const colsCount = layoutRowsMap[rowLettersList[0]]?.length || 10;
    const newSeats: SeatItem[] = [];
    for (let j = 1; j <= colsCount; j++) {
      newSeats.push({
        seatName: `${nextRowLetter}${j}`,
        type: 'regular',
        status: 'active'
      });
    }
    setCurrentSeatLayout(prev => [...prev, ...newSeats]);
    message.success(`⚡ Đã thêm Hàng ghế ${nextRowLetter}!`);
  };

  const handleRemoveRow = () => {
    if (rowLettersList.length <= 1) {
      message.warning('Phòng chiếu phải giữ tối thiểu 1 hàng ghế!');
      return;
    }
    const lastRowLetter = rowLettersList[rowLettersList.length - 1];
    setCurrentSeatLayout(prev => prev.filter(s => !s.seatName.startsWith(lastRowLetter)));
    message.info(`Đã bớt Hàng ghế ${lastRowLetter}`);
  };

  const handleAddColumn = () => {
    const colsCount = layoutRowsMap[rowLettersList[0]]?.length || 10;
    if (colsCount >= 24) {
      message.warning('Tối đa 24 cột ghế mỗi hàng!');
      return;
    }
    const nextCol = colsCount + 1;
    setCurrentSeatLayout(prev => {
      const nextLayout = [...prev];
      rowLettersList.forEach(r => {
        nextLayout.push({
          seatName: `${r}${nextCol}`,
          type: 'regular',
          status: 'active'
        });
      });
      return nextLayout;
    });
    message.success(`⚡ Đã thêm cột ghế thứ ${nextCol}!`);
  };

  const handleRemoveColumn = () => {
    const colsCount = layoutRowsMap[rowLettersList[0]]?.length || 10;
    if (colsCount <= 1) {
      message.warning('Mỗi hàng phải có ít nhất 1 ghế!');
      return;
    }
    setCurrentSeatLayout(prev => prev.filter(s => {
      const match = s.seatName.match(/\d+/);
      return match ? parseInt(match[0]) < colsCount : true;
    }));
    message.info(`Đã bớt cột ghế thứ ${colsCount}`);
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
      title: 'Thống kê Ghế',
      key: 'seatStats',
      render: (_: any, record: Room) => {
        const layout = record.seatLayout || [];
        const total = record.totalSeats || layout.length;
        const maintenanceCount = layout.filter(s => s.type === 'maintenance' || s.status === 'maintenance').length;
        const activeCount = total - maintenanceCount;

        return (
          <Space direction="vertical" size={2}>
            <Tag color="blue" style={{ fontWeight: 'bold' }}>⚡ {total} Ghế tổng cộng</Tag>
            {maintenanceCount > 0 ? (
              <Tag color="error">🛠️ {maintenanceCount} Ghế hỏng/bảo trì ({activeCount} sẵn sàng)</Tag>
            ) : (
              <Tag color="success">✅ Tất cả ghế đang hoạt động tốt</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Định dạng rạp',
      key: 'format',
      render: (_: any, record: Room) => {
        const typeStr = record.type || (record.name.toUpperCase().includes('IMAX') ? 'IMAX 3D' : record.name.toUpperCase().includes('VIP') ? 'Phòng VIP' : '2D Standard');
        if (typeStr.includes('IMAX')) return <Tag color="purple">IMAX 3D</Tag>;
        if (typeStr.includes('VIP')) return <Tag color="gold">Phòng VIP</Tag>;
        if (typeStr.includes('4DX')) return <Tag color="cyan">4DX</Tag>;
        if (typeStr.includes('Sweetbox') || typeStr.includes('Đôi')) return <Tag color="magenta">💕 Sweetbox (Phòng Đôi)</Tag>;
        return <Tag color="green">{typeStr}</Tag>;
      }
    },
    {
      title: 'Trạng Thái Phòng',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'maintenance') {
          return (
            <Tag color="red" style={{ fontWeight: 'bold', padding: '2px 8px' }}>
              🛠️ Tạm ngưng (Bảo trì)
            </Tag>
          );
        }
        return (
          <Tag color="success" style={{ fontWeight: 'bold', padding: '2px 8px' }}>
            🟢 Hoạt động tốt
          </Tag>
        );
      }
    },
    {
      title: 'Trạng Thái Khai Thác',
      key: 'usageStatus',
      render: (_: any, record: Room) => {
        const hasShowtimes = (record.showtimesCount || 0) > 0;
        const hasBookings = (record.bookingsCount || 0) > 0;

        if (hasBookings) {
          return (
            <Tag color="volcano" style={{ fontWeight: 'bold' }}>
              🔒 Đã có {record.bookingsCount} vé đặt ({record.showtimesCount} suất)
            </Tag>
          );
        }
        if (hasShowtimes) {
          return (
            <Tag color="orange" style={{ fontWeight: 'bold' }}>
              📅 Đang có {record.showtimesCount} suất chiếu lên lịch
            </Tag>
          );
        }
        return <Tag color="green">✅ Phòng trống (Có thể xóa)</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Room) => (
        <Space wrap>
          <Button
            type="primary"
            style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
            icon={<SettingOutlined />}
            onClick={() => handleOpenLayoutModal(record)}
          >
            ⚙️ Sơ đồ ghế & Bảo trì
          </Button>

          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
          >
            Sửa
          </Button>

          {record.hasActiveData ? (
            <Tooltip title={`🚫 Khóa xóa: Phòng chiếu đang có ${record.showtimesCount || 0} suất chiếu và ${record.bookingsCount || 0} vé đã đặt!`}>
              <Button danger disabled icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Tooltip>
          ) : (
            <Popconfirm
              title="Xóa phòng chiếu"
              description={`Bạn có chắc chắn muốn xóa phòng chiếu "${record.name}" không?`}
              onConfirm={() => handleDelete(record._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />}>Xóa</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><AppstoreOutlined /> Quản Lý Phòng Chiếu & Sơ Đồ Ghế Bảo Trì</span>
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

      {/* Modal Thêm / Chỉnh Sửa Phòng Chiếu */}
      <Modal
        title={editingRoom ? 'Chỉnh Sửa Thông Tin Phòng Chiếu' : 'Thêm Phòng Chiếu Mới'}
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
            <Select
              placeholder="Chọn định dạng rạp"
              onChange={(val) => {
                if (!editingRoom) {
                  if (val === 'IMAX 3D') {
                    form.setFieldsValue({ rowsCount: 10, seatsPerRow: 12, totalSeats: 120 });
                  } else if (val === '4DX') {
                    form.setFieldsValue({ rowsCount: 6, seatsPerRow: 8, totalSeats: 48 });
                  } else if (val.includes('Sweetbox')) {
                    form.setFieldsValue({ rowsCount: 6, seatsPerRow: 10, totalSeats: 60 });
                  } else if (val === 'Phòng VIP') {
                    form.setFieldsValue({ rowsCount: 7, seatsPerRow: 10, totalSeats: 70 });
                  } else {
                    form.setFieldsValue({ rowsCount: 8, seatsPerRow: 10, totalSeats: 80 });
                  }
                }
              }}
            >
              <Select.Option value="2D Standard">2D Standard (Phòng Tiêu Chuẩn)</Select.Option>
              <Select.Option value="Phòng VIP">Phòng VIP (Ghế Da Cao Cấp)</Select.Option>
              <Select.Option value="IMAX 3D">IMAX 3D (Màn Hình Cực Đại)</Select.Option>
              <Select.Option value="4DX">4DX (Hiệu Ứng Rung Lắc / Gió / Nước)</Select.Option>
              <Select.Option value="Phòng Đôi (Sweetbox)">💕 Sweetbox (Phòng Đôi Lãng Mạn)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng Thái Hoạt Động Của Phòng"
            initialValue="active"
          >
            <Select>
              <Select.Option value="active">🟢 Đang hoạt động tốt</Select.Option>
              <Select.Option value="maintenance">🛠️ Tạm ngưng phục vụ (Đang bảo trì)</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="rowsCount"
              label="Số Hàng Ghế (Rows A-P)"
              rules={[{ required: true, message: 'Nhập số hàng ghế!' }]}
            >
              <InputNumber min={4} max={16} style={{ width: '100%' }} placeholder="VD: 8 hàng (A->H)" />
            </Form.Item>

            <Form.Item
              name="seatsPerRow"
              label="Số Ghế Mỗi Hàng (Columns)"
              rules={[{ required: true, message: 'Nhập số ghế mỗi hàng!' }]}
            >
              <InputNumber min={4} max={20} style={{ width: '100%' }} placeholder="VD: 10 ghế/hàng" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Modal Visual Editor Sơ Đồ Ghế & Bảo Trì */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ToolOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
            <span>Chỉnh Sửa Sơ Đồ Ghế & Đặt Trạng Thái Bảo Trì - {activeRoomForLayout?.name}</span>
          </div>
        }
        open={isLayoutModalOpen}
        onCancel={() => setIsLayoutModalOpen(false)}
        width={950}
        footer={[
          <Button key="close" onClick={() => setIsLayoutModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            loading={isSavingLayout}
            onClick={handleSaveSeatLayout}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Lưu Thay Đổi Sơ Đồ Ghế
          </Button>
        ]}
      >
        <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '12px', color: '#fff' }}>
          {/* Preset Layout Template Selection Bar */}
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #4338ca', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 'bold', color: '#c7d2fe', fontSize: '0.9rem' }}>🎯 NẠP SƠ ĐỒ MẪU THEO LOẠI PHÒNG:</span>
              <Space wrap>
                <Button size="small" type="primary" style={{ background: '#2563eb' }} onClick={() => applyPresetTemplate('standard')}>
                  🎬 2D Standard
                </Button>
                <Button size="small" type="primary" style={{ background: '#d97706' }} onClick={() => applyPresetTemplate('vip')}>
                  ⭐ VIP Luxury
                </Button>
                <Button size="small" type="primary" style={{ background: '#7c3aed' }} onClick={() => applyPresetTemplate('imax')}>
                  🌌 IMAX 3D (10x12)
                </Button>
                <Button size="small" type="primary" style={{ background: '#0284c7' }} onClick={() => applyPresetTemplate('4dx')}>
                  ⚡ 4DX Motion (6x8)
                </Button>
                <Button size="small" type="primary" style={{ background: '#db2777' }} onClick={() => applyPresetTemplate('sweetbox')}>
                  💕 Sweetbox Đôi
                </Button>
              </Space>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>
              💡 *Nạp nhanh sơ đồ mẫu, sau đó tự do chỉnh sửa từng ghế*
            </div>
          </div>

          {/* Thanh công cụ Thêm/Bớt Hàng & Cột & Chế độ vẽ Bút */}
          <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>BÚT VẼ GHẾ:</span>
              <Radio.Group
                value={selectedBrush}
                onChange={(e) => setSelectedBrush(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="regular" style={{ background: selectedBrush === 'regular' ? '#22c55e' : undefined, color: selectedBrush === 'regular' ? '#fff' : undefined }}>
                  🟢 Thường
                </Radio.Button>
                <Radio.Button value="vip" style={{ background: selectedBrush === 'vip' ? '#eab308' : undefined, color: selectedBrush === 'vip' ? '#fff' : undefined }}>
                  ⭐ VIP
                </Radio.Button>
                <Radio.Button value="couple" style={{ background: selectedBrush === 'couple' ? '#ec4899' : undefined, color: selectedBrush === 'couple' ? '#fff' : undefined }}>
                  💕 Đôi
                </Radio.Button>
                <Radio.Button value="maintenance" style={{ background: selectedBrush === 'maintenance' ? '#ef4444' : undefined, color: selectedBrush === 'maintenance' ? '#fff' : undefined }}>
                  🛠️ Bảo Trì
                </Radio.Button>
              </Radio.Group>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>KÍCH THƯỚC:</span>
              <Button size="small" onClick={handleAddRow} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none' }}>
                ➕ Hàng
              </Button>
              <Button size="small" onClick={handleRemoveRow} danger>
                ➖ Hàng
              </Button>
              <Button size="small" onClick={handleAddColumn} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none' }}>
                ➕ Cột
              </Button>
              <Button size="small" onClick={handleRemoveColumn} danger>
                ➖ Cột
              </Button>
            </div>
          </div>

          {/* Màn hình rạp */}
          <div style={{ textAlign: 'center', margin: '0 auto 24px auto', maxWidth: '600px' }}>
            <div style={{ height: '8px', background: 'linear-gradient(90deg, #3b82f6 0%, #e0e7ff 50%, #3b82f6 100%)', borderRadius: '4px', boxShadow: '0 0 15px #3b82f6' }} />
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', letterSpacing: '2px' }}>🖥️ MÀN HÌNH CHIẾU</div>
          </div>

          {/* Ma trận sơ đồ ghế */}
          <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', minWidth: '600px' }}>
              {rowLettersList.map(rowLetter => {
                const rowSeats = layoutRowsMap[rowLetter];
                return (
                  <div key={rowLetter} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Quick Row Action Dropdown */}
                    <DropdownRowMenu rowLetter={rowLetter} onSelectRowType={(t) => handleSetRowType(rowLetter, t)} />

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {rowSeats.map(seat => {
                        const isMaint = seat.type === 'maintenance' || seat.status === 'maintenance';
                        const isVip = seat.type === 'vip';
                        const isCouple = seat.type === 'couple';

                        let bgColor = '#10b981'; // Regular green
                        let borderColor = '#059669';
                        let label = seat.seatName;

                        if (isMaint) {
                          bgColor = '#475569';
                          borderColor = '#ef4444';
                          label = '🛠️';
                        } else if (isVip) {
                          bgColor = '#f59e0b';
                          borderColor = '#d97706';
                        } else if (isCouple) {
                          bgColor = '#ec4899';
                          borderColor = '#db2777';
                        }

                        return (
                          <Tooltip key={seat.seatName} title={`${seat.seatName} (${getSeatTypeName(seat.type)})`}>
                            <button
                              type="button"
                              onClick={() => handleSeatClick(seat.seatName)}
                              style={{
                                width: isCouple ? '64px' : '36px',
                                height: '34px',
                                borderRadius: '6px',
                                background: bgColor,
                                border: `2px solid ${borderColor}`,
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: isMaint ? '14px' : '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {label}
                            </button>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ghi chú chú thích màu */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, paddingTop: 16, borderTop: '1px solid #334155', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, background: '#10b981', borderRadius: 4 }} />
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>Ghế Thường</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, background: '#f59e0b', borderRadius: 4 }} />
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>Ghế VIP (+15.000đ)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 32, height: 16, background: '#ec4899', borderRadius: 4 }} />
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>Ghế Đôi (+15.000đ)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, background: '#475569', border: '1px solid #ef4444', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🛠️</div>
              <span style={{ fontSize: 13, color: '#f87171', fontWeight: 'bold' }}>Đang bảo trì / Hỏng (Khóa đặt vé)</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Component menu bấm chuyển cả hàng ghế
const DropdownRowMenu: React.FC<{ rowLetter: string; onSelectRowType: (type: 'regular' | 'vip' | 'couple' | 'maintenance') => void }> = ({ rowLetter, onSelectRowType }) => {
  return (
    <Tooltip title={`Bấm để đổi loại nhanh toàn bộ Hàng ${rowLetter}`}>
      <Select
        defaultValue={rowLetter}
        value={rowLetter}
        style={{ width: 52 }}
        size="small"
        onChange={(val) => {
          if (val !== rowLetter) {
            onSelectRowType(val as any);
          }
        }}
        options={[
          { label: `Hàng ${rowLetter}`, value: rowLetter },
          { label: `🟢 Set Hàng ${rowLetter} -> Thường`, value: 'regular' },
          { label: `⭐ Set Hàng ${rowLetter} -> VIP`, value: 'vip' },
          { label: `💕 Set Hàng ${rowLetter} -> Đôi`, value: 'couple' },
          { label: `🛠️ Khóa cả Hàng ${rowLetter} (Bảo trì)`, value: 'maintenance' }
        ]}
      />
    </Tooltip>
  );
};

export default Rooms;
