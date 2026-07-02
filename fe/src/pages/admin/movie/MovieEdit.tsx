import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import MovieForm from "./MovieForm";

import {
  getMovie,
  updateMovie,
} from "../../../services/movie.service";

import { Movie } from "../../../types/Movie";

const MovieEdit = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [movie, setMovie] =
    useState<Movie>();

  useEffect(() => {
    const load = async () => {
      const { data } =
        await getMovie(id!);

      setMovie(data);
    };

    load();
  }, []);

  const handleUpdate = async (
    value: Movie
  ) => {
    await updateMovie(id!, value);

    alert("Update success");

    navigate("/admin/movies");
  };

  if (!movie) return <h2>Loading...</h2>;

  return (
    <>
      <h2>Edit Movie</h2>

      <MovieForm
        initialValue={movie}
        onSubmit={handleUpdate}
      />
    </>
  );
};

export default MovieEdit;
