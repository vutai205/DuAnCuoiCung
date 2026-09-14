import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MovieForm from "./MovieForm";
import { getMovie, updateMovie } from "../../../services/movie.service";
import { Movie } from "../../../types/Movie";
import { message, Card, Spin } from "antd";

const MovieEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMovie(id!);
        setMovie(data);
      } catch (error: any) {
        message.error("Không thể tải thông tin phim!");
        navigate("/admin/movies");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const handleUpdate = async (value: Movie) => {
    try {
      await updateMovie(id!, value);
      message.success("Cập nhật thông tin phim thành công!");
      navigate("/admin/movies");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể cập nhật phim!";
      message.error(msg);
    }
  };

  if (loading || !movie) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" tip="Đang tải thông tin phim..." />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <MovieForm
        initialValue={movie}
        onSubmit={handleUpdate}
        titleText="✏️ Chỉnh Sửa Thông Tin Phim"
      />
    </div>
  );
};

export default MovieEdit;
