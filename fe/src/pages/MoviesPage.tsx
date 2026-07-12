import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
      ageRating: ageRating as Movie['ageRating'] | '',
      viewerAge: viewerAge ? Number(viewerAge) : '',
    });
    setMovies(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="movies-page">
      <div className="movies-container">
        <h1>Phim đang chiếu</h1>
        <p className="movies-desc">Chọn phim yêu thích, sau đó chọn rạp, suất chiếu và ghế ngồi.</p>

        <div className="filter-box">
          <select value={ageRating} onChange={(e) => setAgeRating(e.target.value)}>
            <option value="">Tất cả độ tuổi</option>
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
          <p className="movies-loading">Đang tải...</p>
        ) : (
          <div className="movie-grid">
            {movies.map((m) => (
              <div className="movie-card" key={m._id}>
                <img
                  src={m.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={m.title}
                />
                <div className="movie-card__body">
                  <h3>{m.title}</h3>
                  <p>{m.genre}</p>
                  <span className="movie-card__rating">{m.ageRating}</span>
                  <Link to={`/movies/${m._id}`} className="movie-card__btn movie-card__btn--detail">
                    Chi tiết & Đánh giá
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
