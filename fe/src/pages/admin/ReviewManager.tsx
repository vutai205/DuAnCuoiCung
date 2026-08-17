import { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Rate, 
  Tag, 
  Button, 
  Input, 
  Select, 
  Space, 
  Modal, 
  message, 
  Row, 
  Col, 
  Statistic,
  Avatar,
  Typography
} from 'antd';
import { 
  StarFilled, 
  SearchOutlined, 
  EyeOutlined,
  EyeInvisibleOutlined, 
  CommentOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;
const { Paragraph } = Typography;

export default function ReviewManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách đánh giá:', err);
      message.error(err.response?.data?.message || 'Không thể tải danh sách đánh giá!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Ẩn / Hiển thị đánh giá (Soft-hide không xóa dữ liệu)
  const handleToggleHide = async (id: string, currentIsHidden: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/reviews/${id}/toggle-hide`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success(res.data.message || (currentIsHidden ? 'Đã hiển thị lại đánh giá!' : 'Đã ẩn đánh giá khỏi giao diện khách!'));
      fetchReviews();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể thay đổi trạng thái đánh giá!');
    }
  };

  // Mở Modal Phản hồi
  const handleOpenReplyModal = (record: any) => {
    setSelectedReview(record);
    setReplyContent(record.adminReply || '');
    setReplyModalOpen(true);
  };

  // Gửi phản hồi
  const handleSendReply = async () => {
    if (!replyContent.trim()) {
      message.warning('Vui lòng nhập nội dung phản hồi!');
      return;
    }
    setSubmittingReply(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/reviews/${selectedReview._id}/reply`,
        { reply: replyContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Đã lưu phản hồi cho đánh giá!');
      setReplyModalOpen(false);
      fetchReviews();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể lưu phản hồi!');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((item) => {
    const movieTitle = item.movie?.title || item.movieTitle || '';
    const userName = item.user?.name || item.userName || '';
    const comment = item.comment || '';

    const matchSearch = 
      movieTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      userName.toLowerCase().includes(searchText.toLowerCase()) ||
      comment.toLowerCase().includes(searchText.toLowerCase());

    const matchRating = 
      selectedRating === 'all' || item.rating === Number(selectedRating);

    const matchStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'visible' && !item.isHidden) ||
      (selectedStatus === 'hidden' && item.isHidden);

    return matchSearch && matchRating && matchStatus;
  });

  // Calculate Stats
  const totalCount = reviews.length;
  const avgRating = totalCount > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1) 
    : '0';
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const hiddenCount = reviews.filter(r => r.isHidden).length;

  const columns = [
    {
      title: 'Khách Hàng',
      key: 'user',
      width: 190,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Avatar 
            src={record.user?.avatar || record.userAvatar} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>
              {record.user?.name || record.userName || 'Khách hàng'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {record.user?.email || 'N/A'}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Phim Đánh Giá',
      key: 'movie',
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <img 
            src={record.movie?.poster || 'https://via.placeholder.com/40x60'} 
            alt={record.movie?.title}
            style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 4 }}
          />
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
              {record.movie?.title || 'Phim đã xóa'}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {record.movie?.genre || ''}
            </span>
          </div>
        </Space>
      )
    },
    {
      title: 'Đánh Giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 130,
      sorter: (a: any, b: any) => a.rating - b.rating,
      render: (rating: number) => (
        <div>
          <Rate disabled defaultValue={rating} style={{ fontSize: 13, color: '#f59e0b' }} />
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginTop: 2 }}>
            {rating} / 5 Sao
          </div>
        </div>
      )
    },
    {
      title: 'Nội Dung Nhận Xét & Phản Hồi',
      key: 'comment',
      width: 320,
      render: (_: any, record: any) => (
        <div style={{ maxWidth: 300 }}>
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: '...xem thêm' }}
            style={{ margin: 0, color: '#334155', fontSize: '0.88rem', fontWeight: 500 }}
          >
            "{record.comment}"
          </Paragraph>

          {record.adminReply ? (
            <div style={{ marginTop: 6, padding: '6px 10px', backgroundColor: '#f0fdf4', borderLeft: '3px solid #16a34a', borderRadius: 6, fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 'bold', color: '#15803d', marginBottom: 2 }}>
                👑 Admin Phản hồi:
              </div>
              <Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: '...xem đầy đủ' }}
                style={{ margin: 0, color: '#166534', fontSize: '0.8rem' }}
              >
                {record.adminReply}
              </Paragraph>
            </div>
          ) : (
            <Tag color="orange" style={{ marginTop: 6, fontSize: '0.75rem' }}>
              Chưa phản hồi
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 130,
      render: (_: any, record: any) => (
        record.isHidden ? (
          <Tag color="error" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
            👁️‍🗨️ Đã ẩn khỏi Web
          </Tag>
        ) : (
          <Tag color="success" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
            👁️ Đang hiển thị
          </Tag>
        )
      )
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => (
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          {new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 170,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<CommentOutlined />}
            style={{ backgroundColor: '#0284c7' }}
            onClick={() => handleOpenReplyModal(record)}
          >
            Phản hồi
          </Button>

          <Button
            size="small"
            icon={record.isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            style={
              record.isHidden 
                ? { backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#fff' } 
                : { backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: '#fff' }
            }
            onClick={() => handleToggleHide(record._id, record.isHidden)}
          >
            {record.isHidden ? 'Hiện lại' : 'Ẩn đi'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            ⭐ Quản Lý Đánh Giá & Phản Hồi Khách Hàng
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Theo dõi, phản hồi và chuyển trạng thái Ẩn/Hiện đánh giá của khán giả tại TNA Cinema.
          </p>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchReviews}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ color: '#64748b', fontWeight: 500 }}>Tổng số Đánh Giá</span>}
              value={totalCount}
              prefix={<CommentOutlined style={{ color: '#2563eb' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ color: '#64748b', fontWeight: 500 }}>Đánh Giá Trung Bình</span>}
              value={avgRating}
              suffix="/ 5 ⭐"
              valueStyle={{ color: '#d97706' }}
              prefix={<StarFilled style={{ color: '#f59e0b' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ color: '#64748b', fontWeight: 500 }}>Đánh Giá 5 Sao</span>}
              value={fiveStarCount}
              valueStyle={{ color: '#16a34a' }}
              prefix={<CheckCircleOutlined style={{ color: '#16a34a' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ color: '#64748b', fontWeight: 500 }}>Đã Ẩn Khỏi Web</span>}
              value={hiddenCount}
              valueStyle={{ color: hiddenCount > 0 ? '#dc2626' : '#64748b' }}
              prefix={<ExclamationCircleOutlined style={{ color: hiddenCount > 0 ? '#dc2626' : '#64748b' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          <Input
            placeholder="🔍 Tìm theo tên khách hàng, tên phim, nhận xét..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            value={selectedRating}
            onChange={(val) => setSelectedRating(val)}
            style={{ width: 170 }}
          >
            <Option value="all">⭐ Tất cả số sao</Option>
            <Option value="5">⭐⭐⭐⭐⭐ (5 Sao)</Option>
            <Option value="4">⭐⭐⭐⭐ (4 Sao)</Option>
            <Option value="3">⭐⭐⭐ (3 Sao)</Option>
            <Option value="2">⭐⭐ (2 Sao)</Option>
            <Option value="1">⭐ (1 Sao)</Option>
          </Select>

          <Select
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            style={{ width: 170 }}
          >
            <Option value="all">📌 Tất cả trạng thái</Option>
            <Option value="visible">👁️ Đang hiển thị</Option>
            <Option value="hidden">👁️‍🗨️ Đã ẩn trên Web</Option>
          </Select>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredReviews}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          bordered={false}
        />
      </Card>

      {/* Reply Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CommentOutlined style={{ color: '#0284c7' }} />
            <span>Phản Hồi Đánh Giá Từ Khách Hàng</span>
          </div>
        }
        open={replyModalOpen}
        onCancel={() => setReplyModalOpen(false)}
        onOk={handleSendReply}
        confirmLoading={submittingReply}
        okText="Lưu Phản Hồi"
        cancelText="Hủy"
        width={550}
      >
        {selectedReview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10 }}>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                Khách hàng: {selectedReview.user?.name || selectedReview.userName}
              </div>
              <div style={{ marginBottom: 6 }}>
                <Rate disabled defaultValue={selectedReview.rating} style={{ fontSize: 13 }} />
              </div>
              <p style={{ margin: 0, fontStyle: 'italic', color: '#475569' }}>
                "{selectedReview.comment}"
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#1e293b' }}>
                Nội dung Admin phản hồi:
              </label>
              <TextArea
                rows={4}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Cảm ơn quý khách đã trải nghiệm phim tại TNA Cinema..."
              />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
