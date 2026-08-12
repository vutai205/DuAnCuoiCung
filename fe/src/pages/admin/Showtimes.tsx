import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Popconfirm,
  message,
  Tag,
  Space,
  Card,
  Checkbox,
  Alert,
  Tooltip,
  Divider,
  Segmented
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getToken } from '../../services/authApi';

interface ShowtimeItem {
  _id: string;
  movie: { _id: string; title: string; duration: number } | string;
  room: { _id: string; name: string } | string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  bookedSeatsCount?: number;
}

interface DraftShowtime {
  tempId: string;
  selected: boolean;
  movie: string;
  movieTitle: string;
  duration: number;
  room: string;
  roomName: string;
  dateStr: string;
  startTimeStr: string;
  endTimeStr: string;
  startTimeISO: string;
  endTimeISO: string;
  breakTime: number;
  ticketPrice: number;
  hasConflict: boolean;
  conflictReason?: string;
}

const Showtimes: React.FC = () => {
  const [showtimes, setShowtimes] = useState<ShowtimeItem[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'active' | 'expired' | 'all'>('active');

  // Manual Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingShowtime, setEditingShowtime] = useState<ShowtimeItem | null>(null);
  const [form] = Form.useForm();

  // Auto Generate Modal & Draft State
  const [isAutoModalOpen, setIsAutoModalOpen] = useState<boolean>(false);
  const [autoForm] = Form.useForm();
  const [draftShowtimes, setDraftShowtimes] = useState<DraftShowtime[]>([]);
  const [savingBatch, setSavingBatch] = useState<boolean>(false);
  const [breakTimePreset, setBreakTimePreset] = useState<string>('15');

  const getHeaders = () => {
    const token = getToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/showtimes', getHeaders());
      setShowtimes(res.data);
    } catch {
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

  // --- MANUAL MODAL LOGIC ---
  const handleOpenAddModal = () => {
    setEditingShowtime(null);
    form.resetFields();
    form.setFieldsValue({ ticketPrice: 90000 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: ShowtimeItem) => {
    setEditingShowtime(record);
    const movieId = record.movie && typeof record.movie === 'object' ? record.movie._id : record.movie;
    const roomId = record.room && typeof record.room === 'object' ? record.room._id : record.room;

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
      await axios.delete(`/api/showtimes/${id}`, getHeaders());
      message.success('Đã xóa suất chiếu thành công');
      fetchShowtimes();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa suất chiếu');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const selectedMovie = movies.find(m => m._id === values.movie);
      const duration = selectedMovie ? selectedMovie.duration || 120 : 120;
      
      const startTime = values.startTime.toDate();
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      if (!editingShowtime && startTime < new Date()) {
        message.error('Không thể tạo suất chiếu ở thời gian trong quá khứ!');
        return;
      }

      // Client-side conflict pre-check
      const dbConflict = showtimes.find(st => {
        if (editingShowtime && st._id === editingShowtime._id) return false;
        const stRoomId = st.room && typeof st.room === 'object' ? st.room._id : st.room;
        if (stRoomId !== values.room) return false;

        const existingStart = new Date(st.startTime).getTime();
        const existingEnd = new Date(st.endTime).getTime();
        const newStartMs = startTime.getTime();
        const newEndMs = endTime.getTime();

        return newStartMs < existingEnd && newEndMs > existingStart;
      });

      if (dbConflict) {
        const conflictMovieTitle = dbConflict.movie && typeof dbConflict.movie === 'object' ? dbConflict.movie.title : 'Phim khác';
        const conflictRoomName = dbConflict.room && typeof dbConflict.room === 'object' ? dbConflict.room.name : 'Phòng chiếu';
        message.error(`Trùng lịch chiếu! Phòng "${conflictRoomName}" đã có suất chiếu [${conflictMovieTitle}] (${dayjs(dbConflict.startTime).format('HH:mm DD/MM/YYYY')} - ${dayjs(dbConflict.endTime).format('HH:mm DD/MM/YYYY')}).`);
        return;
      }

      const payload = {
        movie: values.movie,
        room: values.room,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        ticketPrice: values.ticketPrice
      };

      if (editingShowtime) {
        await axios.put(`/api/showtimes/${editingShowtime._id}`, payload, getHeaders());
        message.success('Cập nhật suất chiếu thành công');
      } else {
        await axios.post('/api/showtimes', payload, getHeaders());
        message.success('Tạo suất chiếu mới thành công');
      }
      setIsModalOpen(false);
      fetchShowtimes();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi xử lý suất chiếu');
    }
  };

  // --- AUTO GENERATE SHOWTIMES LOGIC ---
  const handleOpenAutoModal = () => {
    autoForm.resetFields();
    autoForm.setFieldsValue({
      date: dayjs(),
      dayStartTime: dayjs('08:00', 'HH:mm'),
      dayEndTime: dayjs('23:00', 'HH:mm'),
      breakTimePreset: '15',
      customBreakTime: 15,
      ticketPrice: 90000
    });
    setBreakTimePreset('15');
    setDraftShowtimes([]);
    setIsAutoModalOpen(true);
  };

  const handleGeneratePreview = (values: any) => {
    const { movie: movieId, room: roomId, date, dayStartTime, dayEndTime, breakTimePreset, customBreakTime, ticketPrice } = values;

    const selectedMovie = movies.find(m => m._id === movieId);
    const selectedRoom = rooms.find(r => r._id === roomId);

    if (!selectedMovie || !selectedRoom) {
      message.error('Vui lòng chọn phim và phòng chiếu hợp lệ');
      return;
    }

    const duration = selectedMovie.duration || 120;
    const breakTimeMinutes = breakTimePreset === 'custom' ? (customBreakTime || 0) : Number(breakTimePreset);

    const baseDate = date.format('YYYY-MM-DD');
    const startHourStr = dayStartTime.format('HH:mm');
    const endHourStr = dayEndTime.format('HH:mm');

    let currentStart = dayjs(`${baseDate} ${startHourStr}`, 'YYYY-MM-DD HH:mm');
    const dayEndBoundary = dayjs(`${baseDate} ${endHourStr}`, 'YYYY-MM-DD HH:mm');

    if (!currentStart.isValid() || !dayEndBoundary.isValid()) {
      message.error('Thời gian bắt đầu hoặc kết thúc không hợp lệ');
      return;
    }

    const newDrafts: DraftShowtime[] = [];
    const now = dayjs();

    while (true) {
      const currentEnd = currentStart.add(duration, 'minute');

      if (currentEnd.isAfter(dayEndBoundary)) {
        break;
      }

      const startTimeISO = currentStart.toDate().toISOString();
      const endTimeISO = currentEnd.toDate().toISOString();

      let hasConflict = false;
      let conflictReason = '';

      if (currentStart.isBefore(now)) {
        hasConflict = true;
        conflictReason = `Suất chiếu thuộc quá khứ (Đã qua giờ hiện tại ${now.format('HH:mm')})`;
      } else {
        const dbConflict = showtimes.find(st => {
          const stRoomId = typeof st.room === 'object' ? st.room._id : st.room;
          if (stRoomId !== roomId) return false;

          const existingStart = new Date(st.startTime).getTime();
          const existingEnd = new Date(st.endTime).getTime();
          const newStart = currentStart.toDate().getTime();
          const newEnd = currentEnd.toDate().getTime();

          return newStart < existingEnd && newEnd > existingStart;
        });

        if (dbConflict) {
          hasConflict = true;
          const conflictMovieTitle = typeof dbConflict.movie === 'object' ? dbConflict.movie.title : 'Phim khác';
          conflictReason = `Trùng suất chiếu [${conflictMovieTitle}] (${dayjs(dbConflict.startTime).format('HH:mm')} - ${dayjs(dbConflict.endTime).format('HH:mm')})`;
        }
      }

      newDrafts.push({
        tempId: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        selected: !hasConflict,
        movie: movieId,
        movieTitle: selectedMovie.title,
        duration: duration,
        room: roomId,
        roomName: selectedRoom.name,
        dateStr: currentStart.format('DD/MM/YYYY'),
        startTimeStr: currentStart.format('HH:mm'),
        endTimeStr: currentEnd.format('HH:mm'),
        startTimeISO,
        endTimeISO,
        breakTime: breakTimeMinutes,
        ticketPrice: ticketPrice || 90000,
        hasConflict,
        conflictReason
      });

      currentStart = currentEnd.add(breakTimeMinutes, 'minute');
    }

    if (newDrafts.length === 0) {
      message.warning('Không có suất chiếu nào được tạo trong khoảng thời gian này!');
    } else {
      setDraftShowtimes(newDrafts);
      message.success(`Đã tự động tạo ${newDrafts.length} suất chiếu nháp (Preview)!`);
    }
  };

  const handleSelectAllDrafts = (checked: boolean) => {
    setDraftShowtimes(prev =>
      prev.map(item => ({
        ...item,
        selected: item.hasConflict ? false : checked
      }))
    );
  };

  const handleToggleDraft = (tempId: string) => {
    setDraftShowtimes(prev =>
      prev.map(item => (item.tempId === tempId ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleDeleteSingleDraft = (tempId: string) => {
    setDraftShowtimes(prev => prev.filter(item => item.tempId !== tempId));
    message.info('Đã xóa 1 suất chiếu khỏi danh sách Preview (Chưa ảnh hưởng Database)');
  };

  const handleDeleteSelectedDrafts = () => {
    const count = draftShowtimes.filter(d => d.selected).length;
    if (count === 0) {
      message.warning('Chưa chọn dòng nào để xóa!');
      return;
    }
    setDraftShowtimes(prev => prev.filter(item => !item.selected));
    message.info(`Đã xóa ${count} dòng khỏi danh sách Preview (Chưa ảnh hưởng Database)`);
  };

  const handleSaveDraftsToDatabase = async () => {
    const selectedValidDrafts = draftShowtimes.filter(d => d.selected && !d.hasConflict);

    if (selectedValidDrafts.length === 0) {
      message.error('Vui lòng chọn ít nhất 1 suất chiếu hợp lệ (không bị trùng lịch) để lưu!');
      return;
    }

    setSavingBatch(true);
    try {
      const payload = selectedValidDrafts.map(d => ({
        movie: d.movie,
        room: d.room,
        startTime: d.startTimeISO,
        endTime: d.endTimeISO,
        ticketPrice: d.ticketPrice
      }));

      const res = await axios.post('/api/showtimes/batch', { showtimes: payload }, getHeaders());
      message.success(res.data.message || `Đã lưu thành công ${selectedValidDrafts.length} suất chiếu vào Database!`);

      setDraftShowtimes([]);
      setIsAutoModalOpen(false);
      fetchShowtimes();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu suất chiếu vào Database. Danh sách Preview vẫn được giữ nguyên.');
    } finally {
      setSavingBatch(false);
    }
  };

  // --- SMART SORTING & FILTERING FOR DATABASE SHOWTIMES ---
  const now = new Date();

  // 1. Classify active vs expired
  const activeShowtimes = showtimes.filter(st => {
    const end = st.endTime ? new Date(st.endTime) : new Date(st.startTime);
    return end >= now;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()); // Closest upcoming first

  const expiredShowtimes = showtimes.filter(st => {
    const end = st.endTime ? new Date(st.endTime) : new Date(st.startTime);
    return end < now;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()); // Most recently expired first

  // Combined sorted list: Active first, then Expired at bottom
  const sortedAllShowtimes = [...activeShowtimes, ...expiredShowtimes];

  const displayedShowtimes = statusFilter === 'active'
    ? activeShowtimes
    : statusFilter === 'expired'
    ? expiredShowtimes
    : sortedAllShowtimes;

  // --- TABLE COLUMNS (DATABASE SHOWTIMES) ---
  const columns = [
    {
      title: 'Tên Phim',
      key: 'movie',
      width: 220,
      render: (_: any, record: ShowtimeItem) => {
        const title = record.movie && typeof record.movie === 'object' ? record.movie.title : 'Chưa xác định';
        return (
          <div style={{ wordBreak: 'break-word', fontWeight: 600, fontSize: '14px', lineHeight: 1.4 }} title={title}>
            {title}
          </div>
        );
      }
    },
    {
      title: 'Phòng Chiếu',
      key: 'room',
      width: 170,
      render: (_: any, record: ShowtimeItem) => {
        const roomName = record.room && typeof record.room === 'object' ? record.room.name : 'Chưa xác định';
        return (
          <div style={{ wordBreak: 'break-word' }}>
            <Tag color="blue" style={{ margin: 0, padding: '2px 8px', fontSize: '12px', whiteSpace: 'normal' }} title={roomName}>
              {roomName}
            </Tag>
          </div>
        );
      }
    },
    {
      title: 'Thời Gian Bắt Đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 170,
      align: 'center' as const,
      render: (dateStr: string) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 600, fontSize: '13px' }}>
            <ClockCircleOutlined style={{ color: '#52c41a', marginRight: 5 }} />
            {dayjs(dateStr).format('HH:mm - DD/MM/YYYY')}
          </span>
        </div>
      )
    },
    {
      title: 'Giá Vé',
      dataIndex: 'ticketPrice',
      key: 'ticketPrice',
      width: 110,
      align: 'right' as const,
      render: (price: number) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <Tag color="red" style={{ fontWeight: 'bold', margin: 0 }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
          </Tag>
        </div>
      )
    },
    {
      title: 'Vé Đã Đặt',
      key: 'bookedSeatsCount',
      width: 110,
      align: 'center' as const,
      render: (_: any, record: ShowtimeItem) => {
        const count = record.bookedSeatsCount || 0;
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            {count > 0 ? (
              <Tag color="volcano" style={{ fontWeight: 'bold', margin: 0 }}>
                🎟️ {count} vé
              </Tag>
            ) : (
              <Tag color="default" style={{ margin: 0 }}>Chưa có</Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Trạng Thái',
      key: 'statusTag',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: ShowtimeItem) => {
        const start = new Date(record.startTime);
        const end = record.endTime ? new Date(record.endTime) : start;

        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            {end < now ? (
              <Tag color="default" style={{ opacity: 0.7, margin: 0 }}>⏳ Đã xong</Tag>
            ) : start <= now && end >= now ? (
              <Tag color="gold" style={{ fontWeight: 'bold', margin: 0 }}>▶️ Đang chiếu</Tag>
            ) : (
              <Tag color="green" style={{ margin: 0 }}>🟢 Sắp chiếu</Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: ShowtimeItem) => {
        const start = new Date(record.startTime);
        const end = record.endTime ? new Date(record.endTime) : start;
        const isExpired = end < now;
        const isInProgress = start <= now && end >= now;
        const hasBookings = (record.bookedSeatsCount || 0) > 0;

        const isEditDisabled = isExpired || isInProgress || hasBookings;
        const isDeleteDisabled = isInProgress || hasBookings;

        let editTooltipText = "";
        if (isInProgress) editTooltipText = "Suất chiếu đang diễn ra, không thể sửa!";
        else if (hasBookings) editTooltipText = `Suất chiếu đã có ${record.bookedSeatsCount} ghế được đặt, không thể sửa!`;
        else if (isExpired) editTooltipText = "Suất chiếu đã kết thúc, không thể sửa!";

        let deleteTooltipText = "";
        if (isInProgress) deleteTooltipText = "Suất chiếu đang diễn ra, không thể xóa!";
        else if (hasBookings) deleteTooltipText = `Suất chiếu đã có ${record.bookedSeatsCount} ghế được đặt, không thể xóa!`;

        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            <Space size="small">
              {isEditDisabled ? (
                <Tooltip title={editTooltipText}>
                  <span>
                    <Button type="primary" size="small" icon={<EditOutlined />} disabled>
                      Sửa
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  type="primary"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenEditModal(record)}
                >
                  Sửa
                </Button>
              )}

              {isDeleteDisabled ? (
                <Tooltip title={deleteTooltipText}>
                  <span>
                    <Button danger size="small" disabled icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Popconfirm
                  title="Xóa suất chiếu"
                  description="Bạn có chắc muốn xóa suất chiếu này không?"
                  onConfirm={() => handleDelete(record._id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
                </Popconfirm>
              )}
            </Space>
          </div>
        );
      }
    }
  ];

  // --- PREVIEW TABLE COLUMNS (DRAFT SHOWTIMES) ---
  const allSelected = draftShowtimes.length > 0 && draftShowtimes.filter(d => !d.hasConflict).every(d => d.selected);

  const previewColumns = [
    {
      title: (
        <Checkbox
          checked={allSelected}
          indeterminate={draftShowtimes.some(d => d.selected) && !allSelected}
          onChange={e => handleSelectAllDrafts(e.target.checked)}
        />
      ),
      key: 'select',
      width: 40,
      align: 'center' as const,
      render: (_: any, record: DraftShowtime) => (
        <Checkbox
          checked={record.selected}
          disabled={record.hasConflict}
          onChange={() => handleToggleDraft(record.tempId)}
        />
      )
    },
    {
      title: 'Phim',
      dataIndex: 'movieTitle',
      key: 'movieTitle',
      width: 180,
      render: (text: string) => (
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600, fontSize: '13px' }}>
          {text}
        </div>
      )
    },
    {
      title: 'Ngày',
      dataIndex: 'dateStr',
      key: 'dateStr',
      width: 110,
      align: 'center' as const,
      render: (text: string) => <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
    },
    {
      title: 'Phòng Chiếu',
      dataIndex: 'roomName',
      key: 'roomName',
      width: 210,
      render: (text: string) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <Tag color="blue" style={{ margin: 0, padding: '2px 8px' }}>{text}</Tag>
        </div>
      )
    },
    {
      title: 'Bắt Đầu',
      dataIndex: 'startTimeStr',
      key: 'startTimeStr',
      width: 90,
      align: 'center' as const,
      render: (text: string) => (
        <div style={{ whiteSpace: 'nowrap', color: '#52c41a', fontWeight: 'bold', fontSize: '14px' }}>{text}</div>
      )
    },
    {
      title: 'Kết Thúc',
      dataIndex: 'endTimeStr',
      key: 'endTimeStr',
      width: 90,
      align: 'center' as const,
      render: (text: string) => (
        <div style={{ whiteSpace: 'nowrap', color: '#ff4d4f', fontWeight: 'bold', fontSize: '14px' }}>{text}</div>
      )
    },
    {
      title: 'Thời Lượng',
      dataIndex: 'duration',
      key: 'duration',
      width: 95,
      align: 'center' as const,
      render: (val: number) => <div style={{ whiteSpace: 'nowrap' }}>{val} phút</div>
    },
    {
      title: 'Nghỉ',
      dataIndex: 'breakTime',
      key: 'breakTime',
      width: 85,
      align: 'center' as const,
      render: (val: number) => <div style={{ whiteSpace: 'nowrap' }}>{val} phút</div>
    },
    {
      title: 'Giá Vé',
      dataIndex: 'ticketPrice',
      key: 'ticketPrice',
      width: 110,
      align: 'right' as const,
      render: (val: number) => <div style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{val.toLocaleString('vi-VN')} đ</div>
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: DraftShowtime) => {
        const isPast = record.conflictReason?.includes('quá khứ') || record.conflictReason?.includes('qua giờ');
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            {record.hasConflict ? (
              <Tooltip title={record.conflictReason}>
                {isPast ? (
                  <Tag color="warning" style={{ margin: 0, fontWeight: 600 }}>⏳ Đã qua giờ</Tag>
                ) : (
                  <Tag color="error" style={{ margin: 0, fontWeight: 600 }}>❌ Trùng lịch</Tag>
                )}
              </Tooltip>
            ) : (
              <Tag color="success" style={{ margin: 0 }}>✅ Hợp lệ</Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Xóa',
      key: 'action',
      width: 60,
      align: 'center' as const,
      render: (_: any, record: DraftShowtime) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSingleDraft(record.tempId)}
          />
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><ClockCircleOutlined /> Quản Lý Suất Chiếu</span>
            <Space>
              <Button
                type="primary"
                style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                icon={<ThunderboltOutlined />}
                onClick={handleOpenAutoModal}
              >
                ⚡ Tạo Suất Chiếu Tự Động
              </Button>
              <Button type="primary" danger icon={<PlusOutlined />} onClick={handleOpenAddModal}>
                Tạo Thủ Công Mới
              </Button>
            </Space>
          </div>
        }
      >
        {/* Quick Filter Bar */}
        <div style={{ marginBottom: 16 }}>
          <Segmented
            options={[
              { label: `🟢 Sắp chiếu & Đang chiếu (${activeShowtimes.length})`, value: 'active' },
              { label: `⏳ Đã kết thúc (${expiredShowtimes.length})`, value: 'expired' },
              { label: `Tất cả (${showtimes.length})`, value: 'all' }
            ]}
            value={statusFilter}
            onChange={val => setStatusFilter(val as any)}
            size="large"
          />
        </div>

        <Table 
          tableLayout="fixed"
          size="middle"
          columns={columns} 
          dataSource={displayedShowtimes} 
          rowKey="_id" 
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10 }}
          rowClassName={(record) => {
            const end = record.endTime ? new Date(record.endTime) : new Date(record.startTime);
            return end < now ? 'expired-showtime-row' : '';
          }}
        />
      </Card>

      <style>{`
        .expired-showtime-row {
          opacity: 0.65;
          background-color: #fafafa;
        }
      `}</style>

      {/* --- MANUAL CREATE/EDIT MODAL --- */}
      <Modal
        title={editingShowtime ? 'Chỉnh Sửa Suất Chiếu' : 'Tạo Suất Chiếu Mới (Thủ công)'}
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

      {/* --- AUTO GENERATE SHOWTIMES MODAL WITH PREVIEW --- */}
      <Modal
        title="⚡ TẠO TỰ ĐỘNG DANH SÁCH SUẤT CHIẾU (Duyệt Preview trước khi Lưu)"
        open={isAutoModalOpen}
        width={1100}
        centered={true}
        footer={null}
        onCancel={() => setIsAutoModalOpen(false)}
      >
        <Alert
          message="💡 Hướng dẫn tạo tự động"
          description="Hệ thống sẽ tính toán các khung giờ chiếu liên tiếp theo công thức: Giờ Bắt Đầu + Thời lượng phim + Thời gian nghỉ. Dữ liệu tạo ra ở dạng TẠM THỜI (Preview) để bạn kiểm tra, chỉ lưu vào Database khi bấm 'Lưu Phim/Suất Chiếu'."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <Form form={autoForm} layout="vertical" onFinish={handleGeneratePreview}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
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
              rules={[{ required: true, message: 'Vui lòng chọn phòng!' }]}
            >
              <Select placeholder="Chọn phòng chiếu">
                {rooms.map(r => (
                  <Select.Option key={r._id} value={r._id}>
                    {r.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="date"
              label="Ngày Chiếu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr', gap: '16px' }}>
            <Form.Item
              name="dayStartTime"
              label="Bắt Đầu Suất 1 Trong Ngày"
              rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="dayEndTime"
              label="Giới Hạn Giờ Kết Thúc"
              rules={[{ required: true, message: 'Vui lòng chọn giờ giới hạn!' }]}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="breakTimePreset"
              label="Thời Gian Nghỉ Giữa Các Suất"
            >
              <Select onChange={val => setBreakTimePreset(val)}>
                <Select.Option value="0">0 phút (Nối tiếp ngay)</Select.Option>
                <Select.Option value="5">5 phút</Select.Option>
                <Select.Option value="10">10 phút</Select.Option>
                <Select.Option value="15">15 phút (Chuẩn Rạp)</Select.Option>
                <Select.Option value="20">20 phút</Select.Option>
                <Select.Option value="30">30 phút</Select.Option>
                <Select.Option value="custom">Nhập số phút tùy ý...</Select.Option>
              </Select>
            </Form.Item>

            {breakTimePreset === 'custom' ? (
              <Form.Item
                name="customBreakTime"
                label="Số Phút Tùy Ý"
                rules={[{ required: true, message: 'Nhập số phút!' }]}
              >
                <InputNumber min={0} max={180} style={{ width: '100%' }} placeholder="Số phút..." />
              </Form.Item>
            ) : (
              <Form.Item
                name="ticketPrice"
                label="Giá Vé Base (VNĐ)"
                rules={[{ required: true, message: 'Nhập giá vé!' }]}
              >
                <InputNumber
                  min={10000}
                  step={5000}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<ThunderboltOutlined />}
              style={{ backgroundColor: '#13c2c2', borderColor: '#13c2c2', height: 40, padding: '0 24px' }}
            >
              Tạo Danh Sách Preview
            </Button>
          </div>
        </Form>

        <Divider style={{ margin: '16px 0' }} />

        {/* --- DRAFT PREVIEW TABLE SECTION --- */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#1890ff' }}>
              📋 Danh Sách Preview Suất Chiếu Tạm Thời ({draftShowtimes.length} suất)
            </h4>
            <Space>
              <Button
                danger
                disabled={draftShowtimes.filter(d => d.selected).length === 0}
                icon={<DeleteOutlined />}
                onClick={handleDeleteSelectedDrafts}
              >
                Xóa dòng đã chọn ({draftShowtimes.filter(d => d.selected).length})
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => setDraftShowtimes([])}
              >
                Xóa tất cả Preview
              </Button>
            </Space>
          </div>

          <Table
            tableLayout="fixed"
            columns={previewColumns}
            dataSource={draftShowtimes}
            rowKey="tempId"
            pagination={false}
            scroll={{ x: 1210, y: 280 }}
            size="small"
            locale={{ emptyText: "Chưa có dữ liệu preview. Nhấn 'Tạo Danh Sách Preview' ở trên để bắt đầu." }}
          />

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', padding: '12px 16px', borderRadius: 8 }}>
            <div>
              <span style={{ fontWeight: 600 }}>
                Đã chọn: <strong style={{ color: '#52c41a' }}>{draftShowtimes.filter(d => d.selected && !d.hasConflict).length}</strong> / {draftShowtimes.length} suất chiếu hợp lệ.
              </span>
              {draftShowtimes.some(d => d.hasConflict) && (
                <span style={{ color: '#ff4d4f', marginLeft: 12, fontSize: '0.85rem' }}>
                  (⚠️ Có {draftShowtimes.filter(d => d.hasConflict).length} suất bị trùng lịch đã bị vô hiệu hóa)
                </span>
              )}
            </div>

            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={savingBatch}
              disabled={draftShowtimes.filter(d => d.selected && !d.hasConflict).length === 0}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', height: 44, padding: '0 28px', fontWeight: 'bold' }}
              onClick={handleSaveDraftsToDatabase}
            >
              💾 Lưu Phim / Suất Chiếu ({draftShowtimes.filter(d => d.selected && !d.hasConflict).length} suất)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Showtimes;
