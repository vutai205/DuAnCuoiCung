import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Space, Card, Row, Col, Select, Upload, message } from "antd";
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { Movie } from "../../../types/Movie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../../services/authApi";

interface Props {
  initialValue?: Movie;
  onSubmit: (movie: Movie) => void;
  titleText?: string;
}

const GENRE_OPTIONS = [
  "Hành Động",
  "Tình Cảm",
  "Hài Hước",
  "Kinh Dị",
  "Hoạt Hình",
  "Viễn Tưởng",
  "Phiêu Lưu",
  "Tâm Lý",
  "Gia Đình",
  "Tội Phạm",
  "Giả Tưởng",
  "Âm Nhạc"
];

const MovieForm: React.FC<Props> = ({ initialValue, onSubmit, titleText }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    if (initialValue) {
      const existingGenres = initialValue.genres && initialValue.genres.length > 0 
        ? initialValue.genres 
        : (initialValue.genre ? initialValue.genre.split(',').map(g => g.trim()) : []);

      form.setFieldsValue({
        ...initialValue,
        genres: existingGenres,
        format: initialValue.format || '2D',
        status: initialValue.status || 'now_showing',
        releaseDate: initialValue.releaseDate ? initialValue.releaseDate.split("T")[0] : "",
      });
    } else {
      form.setFieldsValue({
        title: "",
        description: "",
        duration: 120,
        genres: ["Hành Động"],
        format: "2D",
        status: "now_showing",
        language: "Tiếng Việt - Phụ đề Tiếng Anh",
        releaseDate: new Date().toISOString().split("T")[0],
        poster: "",
        trailer: "",
      });
    }
  }, [initialValue, form]);

  const handleFinish = (values: any) => {
    const selectedGenres: string[] = values.genres || [];
    onSubmit({
      ...initialValue,
      ...values,
      genres: selectedGenres,
      genre: selectedGenres.join(', '),
      duration: Number(values.duration),
    });
  };

  const posterUrl = Form.useWatch("poster", form);

  // Xử lý upload file ảnh lên Server
  const handleUploadImage = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      const token = getToken();
      const response = await axios.post("/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.imageUrl;
      form.setFieldValue("poster", imageUrl);
      message.success("Đã tải ảnh poster lên hệ thống thành công!");
      onSuccess("OK");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Không thể tải ảnh lên server!");
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card
      title={
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>
          {titleText || "Thông Tin Phim"}
        </span>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* Tên phim */}
        <Form.Item
          label="Tên Phim"
          name="title"
          rules={[
            { required: true, message: "Vui lòng nhập tên phim!" },
            { min: 2, message: "Tên phim phải có ít nhất 2 ký tự!" },
          ]}
        >
          <Input placeholder="VD: Lật Mặt 7: Một Điều Ước..." size="large" />
        </Form.Item>

        {/* Mô tả / Nội dung phim */}
        <Form.Item
          label="Mô Tả / Nội Dung Phim"
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả / nội dung phim!" },
            { min: 10, message: "Mô tả phim phải từ 10 ký tự trở lên!" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Nhập tóm tắt nội dung cốt truyện phim..."
            size="large"
          />
        </Form.Item>

        {/* Thể loại (Nhiều thể loại) & Ngôn ngữ */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Thể Loại (Có thể chọn nhiều thể loại)"
              name="genres"
              rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 thể loại!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn thể loại phim..."
                size="large"
                allowClear
              >
                {GENRE_OPTIONS.map((g) => (
                  <Select.Option key={g} value={g}>
                    {g}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ngôn Ngữ / Phụ Đề"
              name="language"
              rules={[{ required: true, message: "Vui lòng nhập ngôn ngữ!" }]}
            >
              <Input placeholder="VD: Tiếng Việt, Phụ đề Tiếng Anh..." size="large" />
            </Form.Item>
          </Col>
        </Row>

        {/* Định dạng Phim & Trạng thái Phim */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Định Dạng Phim"
              name="format"
              rules={[{ required: true, message: "Vui lòng chọn định dạng phim!" }]}
            >
              <Select size="large">
                <Select.Option value="2D">Standard 2D</Select.Option>
                <Select.Option value="3D">Digital 3D</Select.Option>
                <Select.Option value="IMAX 3D">IMAX 3D</Select.Option>
                <Select.Option value="4DX">4DX Motion</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trạng Thái Chiếu"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái phim!" }]}
            >
              <Select size="large">
                <Select.Option value="now_showing">🟢 Đang Chiếu (Now Showing)</Select.Option>
                <Select.Option value="coming_soon">🟡 Sắp Chiếu (Coming Soon)</Select.Option>
                <Select.Option value="ended">🔴 Đã Ngừng Chiếu (Ended)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Thời lượng & Ngày khởi chiếu */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Thời Lượng (Phút)"
              name="duration"
              rules={[
                { required: true, message: "Vui lòng nhập thời lượng phim!" },
                { type: "number", min: 1, max: 600, message: "Thời lượng từ 1 đến 600 phút!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                size="large"
                placeholder="VD: 120"
                min={1}
                max={600}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ngày Khởi Chiếu"
              name="releaseDate"
              rules={[{ required: true, message: "Vui lòng chọn ngày khởi chiếu!" }]}
            >
              <Input type="date" size="large" />
            </Form.Item>
          </Col>
        </Row>

        {/* Upload Ảnh & URL Poster */}
        <Form.Item
          label="Ảnh Poster Phim"
          required
        >
          <Row gutter={12} align="middle">
            <Col flex="1">
              <Form.Item
                name="poster"
                noStyle
                rules={[{ required: true, message: "Vui lòng upload ảnh hoặc nhập URL Poster!" }]}
              >
                <Input placeholder="Tải ảnh lên hoặc dán URL ảnh (https://...)" size="large" />
              </Form.Item>
            </Col>
            <Col>
              <Upload
                customRequest={handleUploadImage}
                showUploadList={false}
                accept="image/*"
              >
                <Button size="large" icon={<UploadOutlined />} loading={uploading}>
                  Tải Ảnh Lên
                </Button>
              </Upload>
            </Col>
          </Row>
        </Form.Item>

        {/* Trailer URL */}
        <Form.Item
          label="Đường Dẫn Trailer Video (URL YouTube)"
          name="trailer"
          rules={[
            { pattern: /^https?:\/\/.+/i, message: "URL Trailer phải bắt đầu bằng http:// hoặc https://" },
          ]}
        >
          <Input placeholder="https://www.youtube.com/watch?v=..." size="large" />
        </Form.Item>

        {/* Preview Poster */}
        {posterUrl && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontWeight: 600, marginBottom: "8px", color: "#374151" }}>Xem Trước Poster:</div>
            <img
              src={posterUrl}
              alt="Poster Preview"
              style={{
                width: "110px",
                height: "155px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #d9d9d9",
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <Space size="middle" style={{ marginTop: "10px" }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
            style={{ backgroundColor: "#2563eb" }}
          >
            Lưu Thông Tin Phim
          </Button>

          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/movies")}
          >
            Quay Lại
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default MovieForm;
