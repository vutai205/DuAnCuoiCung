import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, Switch, Popconfirm, message, Tag, Space, Card, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { getToken } from '../../services/authApi';

interface BannerItem {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

const BannerManager: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [form] = Form.useForm();

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await axios.get('/api/banners/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(res.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách Banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    form.setFieldsValue({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      isActive: banner.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getToken();
      await axios.delete(`/api/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đã xóa Banner thành công');
      fetchBanners();
    } catch (err: any) {
      message.error('Lỗi khi xóa Banner');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingBanner) {
        await axios.put(`/api/banners/${editingBanner._id}`, values, config);
        message.success('Cập nhật Banner thành công');
      } else {
        await axios.post('/api/banners', values, config);
        message.success('Thêm Banner mới thành công');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      message.error('Lỗi khi lưu Banner');
    }
  };

  const columns = [
    {
      title: 'Hình Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) => (
        <Image
          src={url}
          alt="banner"
          width={140}
          height={65}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          fallback="https://via.placeholder.com/140x65?text=No+Image"
        />
      )
    },
    {
      title: 'Tiêu Đề Banner',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong style={{ fontSize: '15px' }}>{text || 'Banner Quảng Cáo'}</strong>
    },
    {
      title: 'Đường Dẫn Đích',
      dataIndex: 'linkUrl',
      key: 'linkUrl',
      render: (url: string) => <span style={{ color: '#1890ff' }}>{url || '/'}</span>
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Đang hiển thị' : 'Đã ẩn'}
        </Tag>
      )
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_: any, record: BannerItem) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa Banner"
            description="Bạn có chắc chắn muốn xóa Banner này không?"
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
            <span><PictureOutlined /> Quản Lý Banner Quảng Cáo</span>
            <Button type="primary" danger icon={<PlusOutlined />} onClick={handleOpenAddModal}>
              Thêm Banner Mới
            </Button>
          </div>
        }
      >
        <Table 
          columns={columns} 
          dataSource={banners} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title={editingBanner ? 'Chỉnh Sửa Banner' : 'Thêm Banner Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingBanner ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu Đề Banner"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề banner!' }]}
          >
            <Input placeholder="VD: Bom Tấn Mùa Hè 2026" />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="URL Hình Ảnh Banner"
            rules={[{ required: true, message: 'Vui lòng nhập đường dẫn hình ảnh!' }]}
          >
            <Input placeholder="https://images.unsplash.com/..." />
          </Form.Item>

          <Form.Item
            name="linkUrl"
            label="Đường Dẫn Liên Kết (Link)"
          >
            <Input placeholder="VD: /movie hoặc /showtimes" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Kích Hoạt Hiển Thị"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BannerManager;
