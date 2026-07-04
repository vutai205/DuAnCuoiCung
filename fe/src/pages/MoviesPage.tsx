import { useEffect, useState } from 'react';
import { getMovies } from '../services/movieApi';
import type { Movie } from '../types/movie';
import '../styles/movies.css';
export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [ageRating, setAgeRating] = useState('');
  const [viewerAge, setViewerAge] = useState('');
  const fetchMovies = async () => {
    setLoading(true);
    const data = await getMovies({
      ageRating: ageRating as any,
      viewerAge: viewerAge ? Number(viewerAge) : ''
    });
    setMovies(data);
    setLoading(false);
  };
  useEffect(() => {
    fetchMovies();
  }, []);
  return (
    <div className="movies-container">
      <h1>Danh sách phim</h1>
      <div className="filter-box">
        <select value={ageRating} onChange={(e) => setAgeRating(e.target.value)}>
          <option value="">Tất cả</option>
          <option value="P">P</option>
          <option value="K">K</option>
          <option value="T13">T13</option>
          <option value="T16">T16</option>
          <option value="T18">T18</option>
          <option value="C">C</option>
        </select>
        <input
          placeholder="Tuổi người xem"
          value={viewerAge}
          onChange={(e) => setViewerAge(e.target.value)}
        />
        <button onClick={fetchMovies}>Lọc</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="movie-grid">
          {movies.map((m) => (
            <div className="movie-card" key={m._id}>
              <img src={m.poster} alt={m.title} />
              <h3>{m.title}</h3>
              <p>{m.genre}</p>
              <span>{m.ageRating}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
