import { useNavigate } from "react-router-dom";
import MovieForm from "./MovieForm";
import { addMovie } from "../../../services/movie.service";
import { Movie } from "../../../types/Movie";
import { message } from "antd";

const MovieAdd = () => {
  const navigate = useNavigate();

  const handleAdd = async (movie: Movie) => {
    try {
      await addMovie(movie);
      message.success("Thêm phim mới thành công!");
      navigate("/admin/movies");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể thêm phim mới!";
      message.error(msg);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <MovieForm onSubmit={handleAdd} titleText="🎬 Thêm Phim Mới" />
    </div>
  );
};

export default MovieAdd;
