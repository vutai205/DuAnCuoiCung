import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
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
  Dropdown,
  Typography
} from 'antd';
import { 
  MailOutlined, 
  SearchOutlined, 
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SendOutlined,
  DownOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;
const { Paragraph } = Typography;

export default function ContactManager() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal Email Reply State
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/contact', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách liên hệ:', err);
      message.error(err.response?.data?.message || 'Không thể tải danh sách liên hệ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Thay đổi trạng thái liên hệ
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/contact/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đã cập nhật trạng thái liên hệ!');
      fetchContacts();
    } catch (err: any) {
      message.error('Không thể cập nhật trạng thái!');
    }
  };

  // Mở Modal Phản hồi Email
  const handleOpenEmailModal = (record: any) => {
    setSelectedContact(record);
    setEmailSubject(`[TNA CINEMA] Phản hồi yêu cầu hỗ trợ #${record._id.toString().slice(-6)}`);
    setReplyMessage(record.adminReply || `Chào ${record.fullname},\n\nCụm rạp TNA Cinema cảm ơn bạn đã gửi ý kiến phản hồi. Về yêu cầu của bạn, TNA Cinema xin phản hồi như sau:\n\n[Nhập nội dung phản hồi tại đây]\n\nTrân trọng,\nBan Quản Lý TNA Cinema.`);
    setEmailModalOpen(true);
  };

  // Gửi Email trực tiếp cho khách hàng
  const handleSendEmailReply = async () => {
    if (!replyMessage.trim()) {
      message.warning('Vui lòng nhập nội dung email phản hồi!');
      return;
    }
    setSendingEmail(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `/api/contact/${selectedContact._id}/reply`,
        { 
          emailSubject: emailSubject.trim(), 
          replyMessage: replyMessage.trim() 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      message.success(res.data.message);
      setEmailModalOpen(false);
      fetchContacts();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể gửi email phản hồi!');
    } finally {
      setSendingEmail(false);
    }
  };

  // Label Map cho Chủ đề
  const topicMap: Record<string, { label: string; color: string }> = {
    ticket_support: { label: '🎫 Hỗ trợ đặt vé / Thanh toán', color: 'blue' },
    group_booking: { label: '🏢 Đặt rạp nhóm / Sự kiện', color: 'purple' },
    feedback: { label: '💬 Phản ánh chất lượng dịch vụ', color: 'orange' },
    lost_item: { label: '🔍 Thất lạc đồ', color: 'volcano' },
    other: { label: '📌 Vấn đề khác', color: 'default' }
  };

  // Filter contacts
  const filteredContacts = contacts.filter((item) => {
    const name = item.fullname || '';
    const email = item.email || '';
    const phone = item.phone || '';
    const msg = item.message || '';

    const matchSearch = 
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      email.toLowerCase().includes(searchText.toLowerCase()) ||
      phone.includes(searchText) ||
      msg.toLowerCase().includes(searchText.toLowerCase());

    const matchTopic = selectedTopic === 'all' || item.topic === selectedTopic;
    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchSearch && matchTopic && matchStatus;
  });

  // Calculate Stats
  const totalCount = contacts.length;
  const pendingCount = contacts.filter(c => c.status === 'pending').length;
  const resolvedCount = contacts.filter(c => c.status === 'resolved').length;

  const columns = [
    {
      title: 'Khách Hàng',
      key: 'customer',
      width: 220,
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserOutlined style={{ color: '#e50914' }} /> {record.fullname}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
            <PhoneOutlined /> {record.phone}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#0284c7', marginTop: 2 }}>
            <MailOutlined /> {record.email}
          </div>
        </div>
      )
    },
    {
      title: 'Chủ Đề Yêu Cầu',
      dataIndex: 'topic',
      key: 'topic',
      width: 190,
      render: (topic: string) => {
        const info = topicMap[topic] || { label: topic, color: 'default' };
        return <Tag color={info.color} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>{info.label}</Tag>;
      }
    },
    {
      title: 'Nội Dung Phản Hồi Của Khách',
      key: 'message',
      width: 320,
      render: (_: any, record: any) => (
        <div style={{ maxWidth: 300 }}>
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: '...xem thêm' }}
            style={{ margin: 0, color: '#334155', fontSize: '0.88rem', fontWeight: 500 }}
          >
            "{record.message}"
          </Paragraph>

          {record.adminReply ? (
            <div style={{ marginTop: 6, padding: '6px 10px', backgroundColor: '#f0fdf4', borderLeft: '3px solid #16a34a', borderRadius: 6, fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 'bold', color: '#15803d', marginBottom: 2 }}>
                📩 Đã gửi Mail phản hồi:
              </div>
              <Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: '...xem đầy đủ' }}
                style={{ margin: 0, color: '#166534', fontSize: '0.8rem' }}
              >
                {record.adminReply}
              </Paragraph>
            </div>
          ) : (
            <Tag color="volcano" style={{ marginTop: 6, fontSize: '0.75rem' }}>
              Chưa gửi phản hồi Email
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        if (status === 'resolved') {
          return <Tag color="success" style={{ padding: '4px 8px' }}>✅ Đã xử lý</Tag>;
        }
        if (status === 'processing') {
          return <Tag color="processing" style={{ padding: '4px 8px' }}>⏳ Đang xử lý</Tag>;
        }
        return <Tag color="warning" style={{ padding: '4px 8px' }}>🔔 Chờ xử lý</Tag>;
      }
    },
    {
      title: 'Ngày Gửi',
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
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            style={{ backgroundColor: '#e50914', borderColor: '#e50914' }}
            onClick={() => handleOpenEmailModal(record)}
          >
            Phản Hồi Email
          </Button>

          <Dropdown
            menu={{
              items: [
                { key: 'pending', label: '🔔 Đặt trạng thái: Chờ xử lý' },
                { key: 'processing', label: '⏳ Đặt trạng thái: Đang xử lý' },
                { key: 'resolved', label: '✅ Đặt trạng thái: Đã xử lý' }
              ],
              onClick: ({ key }) => handleUpdateStatus(record._id, key)
            }}
            trigger={['click']}
          >
            <Button size="small">
              Đổi <DownOutlined />
            </Button>
          </Dropdown>
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
            📩 Quản Lý Phản Hồi & Liên Hệ Khách Hàng
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Xem các yêu cầu hỗ trợ, góp ý của khách hàng và gửi Email phản hồi trực tiếp.
          </p>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchContacts}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ color: '#64748b', fontWeight: 500 }}>Tổng Yêu Cầu Liên Hệ</span>}
              value={totalCount}
              prefix={<MailOutlined style={{ color: '#2563eb' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ color: '#64748b', fontWeight: 500 }}>Chờ Xử Lý</span>}
              value={pendingCount}
              valueStyle={{ color: '#d97706' }}
              prefix={<ClockCircleOutlined style={{ color: '#d97706' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ color: '#64748b', fontWeight: 500 }}>Đã Phản Hồi / Xử Lý</span>}
              value={resolvedCount}
              valueStyle={{ color: '#16a34a' }}
              prefix={<CheckCircleOutlined style={{ color: '#16a34a' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          <Input
            placeholder="🔍 Tìm theo họ tên, email, SĐT, nội dung..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            value={selectedTopic}
            onChange={(val) => setSelectedTopic(val)}
            style={{ width: 210 }}
          >
            <Option value="all">📌 Tất cả chủ đề</Option>
            <Option value="ticket_support">🎫 Hỗ trợ đặt vé / Thanh toán</Option>
            <Option value="group_booking">🏢 Đặt rạp nhóm / Sự kiện</Option>
            <Option value="feedback">💬 Phản ánh chất lượng dịch vụ</Option>
            <Option value="lost_item">🔍 Thất lạc đồ</Option>
            <Option value="other">📌 Vấn đề khác</Option>
          </Select>

          <Select
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            style={{ width: 170 }}
          >
            <Option value="all">⚡ Tất cả trạng thái</Option>
            <Option value="pending">🔔 Chờ xử lý</Option>
            <Option value="processing">⏳ Đang xử lý</Option>
            <Option value="resolved">✅ Đã xử lý</Option>
          </Select>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredContacts}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          bordered={false}
        />
      </Card>

      {/* Email Reply Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e50914' }}>
            <SendOutlined />
            <span>Gửi Email Phản Hồi Trực Tiếp Cho Khách Hàng</span>
          </div>
        }
        open={emailModalOpen}
        onCancel={() => setEmailModalOpen(false)}
        onOk={handleSendEmailReply}
        confirmLoading={sendingEmail}
        okText="Gửi Email Phản Hồi"
        cancelText="Hủy"
        width={600}
      >
        {selectedContact && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10 }}>
            
            {/* Box thông tin khách hàng */}
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                Gửi tới: <span style={{ color: '#e50914' }}>{selectedContact.fullname}</span> ({selectedContact.email})
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 6 }}>
                Số điện thoại: <strong>{selectedContact.phone}</strong> | Ngày gửi: {new Date(selectedContact.createdAt).toLocaleString('vi-VN')}
              </div>
              <div style={{ backgroundColor: '#fff', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}>
                <strong>Yêu cầu của khách:</strong> "{selectedContact.message}"
              </div>
            </div>

            {/* Form Soạn Email */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#1e293b' }}>
                Tiêu đề Email (Subject):
              </label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Tiêu đề email..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#1e293b' }}>
                Nội dung Email gửi trực tiếp tới khách hàng:
              </label>
              <TextArea
                rows={6}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Nhập nội dung phản hồi chi tiết..."
              />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
