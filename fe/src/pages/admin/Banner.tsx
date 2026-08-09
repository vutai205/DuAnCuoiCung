import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, Switch, Popconfirm, message, Tag, Space, Card, Image, Upload, Segmented, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, InboxOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
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
  const [uploading, setUploading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [previewUrl, setPreviewUrl] = useState<string>('');
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
    setPreviewUrl('');
    setUploadMode('file');
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setPreviewUrl(banner.imageUrl);
    setUploadMode(banner.imageUrl && banner.imageUrl.startsWith('http') && !banner.imageUrl.includes('/uploads/') ? 'url' : 'file');
    form.setFieldsValue({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      isActive: banner.isActive
    });
    setIsModalOpen(true);
  };

  const handleCustomUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = getToken();
      const res = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const uploadedUrl = res.data.imageUrl;
      form.setFieldsValue({ imageUrl: uploadedUrl });
      setPreviewUrl(uploadedUrl);
      message.success('Đã tải hình ảnh từ máy tính lên thành công!');
    } catch (err: any) {
      // Fallback read as Base64 Data URL if server endpoint fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target?.result as string;
        form.setFieldsValue({ imageUrl: base64Url });
        setPreviewUrl(base64Url);
        message.success('Đã tải hình ảnh từ máy tính thành công!');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
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
    if (!values.imageUrl) {
      message.error('Vui lòng chọn hình ảnh từ máy tính hoặc nhập URL!');
      return;
    }

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
        width={580}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu Đề Banner"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề banner!' }]}
          >
            <Input placeholder="VD: Bom Tấn Mùa Hè 2026" size="large" />
          </Form.Item>

          <Form.Item label="Phương Thức Chọn Ảnh Banner">
            <Segmented
              value={uploadMode}
              onChange={(value) => setUploadMode(value as 'file' | 'url')}
              options={[
                { label: '💻 Chọn ảnh từ máy tính', value: 'file', icon: <UploadOutlined /> },
                { label: '🔗 Nhập URL trực tiếp', value: 'url', icon: <LinkOutlined /> },
              ]}
              block
              style={{ marginBottom: '12px' }}
            />
          </Form.Item>

          {/* Mode 1: File Upload from Computer */}
          {uploadMode === 'file' ? (
            <Form.Item
              label="Tập Tin Hình Ảnh Từ Máy Tính *"
              help="Định dạng hỗ trợ: PNG, JPG, WEBP"
            >
              <Upload.Dragger
                name="image"
                multiple={false}
                showUploadList={false}
                accept="image/*"
                beforeUpload={(file) => {
                  handleCustomUpload(file);
                  return false;
                }}
                style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}
              >
                {uploading ? (
                  <div style={{ padding: '20px 0' }}>
                    <Spin tip="Đang tải ảnh lên..." />
                  </div>
                ) : previewUrl ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={previewUrl}
                      alt="Banner Preview"
                      style={{
                        maxHeight: '150px',
                        maxWidth: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <div>
                      <Button icon={<UploadOutlined />}>Chọn / Thay đổi ảnh khác từ máy tính</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ fontSize: '36px', color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontWeight: 600, fontSize: '15px' }}>
                      Bấm vào đây hoặc kéo thả ảnh từ máy tính vào đây
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#888', fontSize: '13px' }}>
                      Chọn file hình ảnh từ thư mục máy tính của bạn
                    </p>
                  </div>
                )}
              </Upload.Dragger>
            </Form.Item>
          ) : (
            /* Mode 2: Direct URL */
            <Form.Item
              name="imageUrl"
              label="URL Hình Ảnh Banner *"
              rules={[{ required: true, message: 'Vui lòng nhập đường dẫn hình ảnh!' }]}
            >
              <Input
                placeholder="https://images.unsplash.com/..."
                size="large"
                onChange={(e) => setPreviewUrl(e.target.value)}
              />
            </Form.Item>
          )}

          {/* Hidden Form Item to store actual imageUrl string */}
          <Form.Item name="imageUrl" noStyle hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="linkUrl"
            label="Đường Dẫn Liên Kết (Link Đích Khi Bấm Vào Banner)"
          >
            <Input placeholder="VD: /movie hoặc /showtimes" size="large" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Kích Hoạt Hiển Thị Banner"
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
