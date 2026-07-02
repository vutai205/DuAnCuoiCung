import { useEffect, useState } from "react";
import {
  deleteMovie,
  getMovies,
} from "../../../services/movie.service";
import { Movie } from "../../../types/Movie";
import { Link } from "react-router-dom";

const MovieList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);

  const loadMovie = async () => {
    const { data } = await getMovies();
    setMovies(data);
  };

  useEffect(() => {
    loadMovie();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete movie ?")) return;

    await deleteMovie(id);

    loadMovie();
  };

  return (
    <div className="movie-page">

      <div className="page-title">

        <h2>Movie Manager</h2>

        <Link
          to="/admin/movies/add"
          className="btn-add"
        >
          Add Movie
        </Link>

      </div>

      <table>

        <thead>

          <tr>

            <th>#</th>

            <th>Poster</th>

            <th>Title</th>

            <th>Genre</th>

            <th>Duration</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {movies.map((movie, index) => (

            <tr key={movie._id}>

              <td>{index + 1}</td>

              <td>

                <img
                  src={movie.poster}
                  width={70}
                />

              </td>

              <td>{movie.title}</td>

              <td>{movie.genre}</td>

              <td>{movie.duration} phút</td>

              <td>

                <Link
                  to={`/admin/movies/edit/${movie._id}`}
                  className="btn-edit"
                >
                  Edit
                </Link>

                <button
                  className="btn-delete"
                  onClick={() =>
                    handleDelete(movie._id!)
                  }
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default MovieList;
