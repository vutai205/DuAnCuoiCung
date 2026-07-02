import { useState } from "react";
import { Movie } from "../../../types/Movie";

interface Props {
  initialValue?: Movie;
  onSubmit: (movie: Movie) => void;
}

const MovieForm = ({ initialValue, onSubmit }: Props) => {
  const [movie, setMovie] = useState<Movie>(
    initialValue || {
      title: "",
      description: "",
      duration: 0,
      genre: "",
      language: "",
      releaseDate: "",
      poster: "",
      trailer: "",
      status: true,
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setMovie({
      ...movie,
      [name]:
        name === "duration"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    onSubmit(movie);
  };

  return (
    <form
      className="movie-form"
      onSubmit={handleSubmit}
    >
      <input
        name="title"
        placeholder="Movie title"
        value={movie.title}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Description"
        value={movie.description}
        onChange={handleChange}
      />

      <input
        name="genre"
        placeholder="Genre"
        value={movie.genre}
        onChange={handleChange}
      />

      <input
        name="language"
        placeholder="Language"
        value={movie.language}
        onChange={handleChange}
      />

      <input
        type="number"
        name="duration"
        placeholder="Duration"
        value={movie.duration}
        onChange={handleChange}
      />

      <input
        type="date"
        name="releaseDate"
        value={movie.releaseDate}
        onChange={handleChange}
      />

      <input
        name="poster"
        placeholder="Poster URL"
        value={movie.poster}
        onChange={handleChange}
      />

      <input
        name="trailer"
        placeholder="Trailer URL"
        value={movie.trailer}
        onChange={handleChange}
      />

      <button type="submit">
        Save Movie
      </button>
    </form>
  );
};

export default MovieForm;
