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
  totalSeats: number;
  rowsCount?: number;
  seatsPerRow?: number;
  seatLayout?: SeatItem[];
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
      await axios.delete(`/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đã xóa phòng chiếu thành công');
      fetchRooms();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa phòng chiếu');
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

  // Seat layout visual editor actions
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
        return <Tag color="green">{typeStr}</Tag>;
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

  // Group current seat layout by rows for rendering visual seat map
  const layoutRowsMap: { [row: string]: SeatItem[] } = {};
  currentSeatLayout.forEach(s => {
    const match = s.seatName.match(/^([A-Z]+)(\d+)$/);
    const rowLetter = match ? match[1] : 'A';
    if (!layoutRowsMap[rowLetter]) layoutRowsMap[rowLetter] = [];
    layoutRowsMap[rowLetter].push(s);
  });
  const rowLettersList = Object.keys(layoutRowsMap).sort();

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
            <Select placeholder="Chọn định dạng rạp">
              <Select.Option value="2D Standard">2D Standard (Phòng Tiêu Chuẩn)</Select.Option>
              <Select.Option value="Phòng VIP">Phòng VIP (Ghế Da Cao Cấp)</Select.Option>
              <Select.Option value="IMAX 3D">IMAX 3D (Màn Hình Cực Đại)</Select.Option>
              <Select.Option value="4DX">4DX (Hiệu Ứng Rung Lắc / Gió / Nước)</Select.Option>
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
          {/* Cài đặt chế độ chọn (Brush palette) */}
          <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontWeight: 'bold', marginRight: 12, color: '#94a3b8' }}>BÚT CHỌN LOẠI GHẾ:</span>
              <Radio.Group
                value={selectedBrush}
                onChange={(e) => setSelectedBrush(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="regular" style={{ background: selectedBrush === 'regular' ? '#22c55e' : undefined, color: selectedBrush === 'regular' ? '#fff' : undefined }}>
                  🟢 Ghế Thường
                </Radio.Button>
                <Radio.Button value="vip" style={{ background: selectedBrush === 'vip' ? '#eab308' : undefined, color: selectedBrush === 'vip' ? '#fff' : undefined }}>
                  ⭐ Ghế VIP
                </Radio.Button>
                <Radio.Button value="couple" style={{ background: selectedBrush === 'couple' ? '#ec4899' : undefined, color: selectedBrush === 'couple' ? '#fff' : undefined }}>
                  💕 Ghế Đôi
                </Radio.Button>
                <Radio.Button value="maintenance" style={{ background: selectedBrush === 'maintenance' ? '#ef4444' : undefined, color: selectedBrush === 'maintenance' ? '#fff' : undefined }}>
                  🛠️ Đang bảo trì / Hỏng
                </Radio.Button>
              </Radio.Group>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              👉 *Bấm trực tiếp vào ghế để đổi loại ghế theo bút chọn*
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
