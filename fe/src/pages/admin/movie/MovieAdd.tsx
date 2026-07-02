import { useNavigate } from "react-router-dom";
import MovieForm from "./MovieForm";
import { addMovie } from "../../../services/movie.service";
import { Movie } from "../../../types/Movie";

const MovieAdd = () => {
  const navigate = useNavigate();

  const handleAdd = async (
    movie: Movie
  ) => {
    await addMovie(movie);

    alert("Add success");

    navigate("/admin/movies");
  };

  return (
    <>
      <h2>Add Movie</h2>

      <MovieForm
        onSubmit={handleAdd}
      />
    </>
  );
};

export default MovieAdd;
