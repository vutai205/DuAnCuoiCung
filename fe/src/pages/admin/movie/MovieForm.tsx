import React, { useEffect } from "react";
import { Form, Input, InputNumber, Button, Space, Card, Row, Col } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Movie } from "../../../types/Movie";
import { useNavigate } from "react-router-dom";

interface Props {
  initialValue?: Movie;
  onSubmit: (movie: Movie) => void;
  titleText?: string;
}

const MovieForm: React.FC<Props> = ({ initialValue, onSubmit, titleText }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialValue) {
      form.setFieldsValue({
        ...initialValue,
        releaseDate: initialValue.releaseDate ? initialValue.releaseDate.split("T")[0] : "",
      });
    } else {
      form.setFieldsValue({
        title: "",
        description: "",
        duration: 120,
        genre: "",
        language: "Tiếng Việt - Phụ đề Tiếng Anh",
        releaseDate: new Date().toISOString().split("T")[0],
        poster: "",
        trailer: "",
      });
    }
  }, [initialValue, form]);

  const handleFinish = (values: any) => {
    onSubmit({
      ...initialValue,
      ...values,
      duration: Number(values.duration),
    });
  };

  const posterUrl = Form.useWatch("poster", form);

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

        {/* Thể loại & Ngôn ngữ */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Thể Loại"
              name="genre"
              rules={[{ required: true, message: "Vui lòng nhập thể loại phim!" }]}
            >
              <Input placeholder="VD: Hành Động / Viễn Tưởng..." size="large" />
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

        {/* Poster URL */}
        <Form.Item
          label="Đường Dẫn Ảnh Poster (URL)"
          name="poster"
          rules={[
            { required: true, message: "Vui lòng nhập URL ảnh Poster!" },
            { pattern: /^https?:\/\/.+/i, message: "URL Poster phải bắt đầu bằng http:// hoặc https://" },
          ]}
        >
          <Input placeholder="https://images.unsplash.com/photo-..." size="large" />
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
        {posterUrl && /^https?:\/\/.+/i.test(posterUrl.trim()) && (
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
