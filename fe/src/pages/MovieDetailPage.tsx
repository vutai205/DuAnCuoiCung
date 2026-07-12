import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { getMovieById } from '../services/movieApi';
import { getMovieReviews, createReview } from '../services/reviewApi';
import { getAuthUser } from '../services/authApi';
import type { Movie } from '../types/movie';
import type { Review } from '../types/review';
import '../styles/reviews.css';

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className={`star-rating ${readonly ? 'star-rating--readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? 'star star--active' : 'star'}
          disabled={readonly}
          onClick={() => onChange?.(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const user = getAuthUser();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchData = async () => {
    if (!movieId) return;
    setLoading(true);
    setError('');
    try {
      const [movieData, reviewData] = await Promise.all([
        getMovieById(movieId),
        getMovieReviews(movieId),
      ]);
      setMovie(movieData);
      setReviews(reviewData.reviews);
      setAverageRating(reviewData.stats.average);
      setTotalReviews(reviewData.stats.total);
    } catch {
      setError('Không tải được thông tin phim.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [movieId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieId || !comment.trim()) return;

    setSubmitting(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await createReview(movieId, rating, comment.trim());
      setComment('');
      setRating(5);
      setReviewSuccess('Cảm ơn bạn đã đánh giá phim!');
      await fetchData();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setReviewError(err.response?.data?.message || 'Gửi đánh giá thất bại.');
      } else {
        setReviewError('Gửi đánh giá thất bại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="movie-detail-loading">Đang tải...</p>;
  }

  if (error || !movie) {
    return (
      <div className="movie-detail-page">
        <div className="movie-detail-container">
          <div className="movie-detail-alert">{error || 'Không tìm thấy phim'}</div>
          <Link to="/movies" className="movie-detail-back">← Quay lại</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail-page">
      <div className="movie-detail-container">
        <Link to="/movies" className="movie-detail-back">← Quay lại danh sách phim</Link>

        <div className="movie-detail-header">
          <img
            src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
            alt={movie.title}
            className="movie-detail-poster"
          />
          <div className="movie-detail-info">
            <h1>{movie.title}</h1>
            <p className="movie-detail-genre">{movie.genre} · {movie.ageRating}</p>
            <p className="movie-detail-desc">{movie.description}</p>
            <div className="movie-detail-rating-summary">
              <StarRating value={Math.round(averageRating)} readonly />
              <span>
                {averageRating > 0 ? `${averageRating}/5` : 'Chưa có đánh giá'}
                {totalReviews > 0 && ` (${totalReviews} đánh giá)`}
              </span>
            </div>
            {user ? (
              <Link to={`/booking/${movie._id}`} className="movie-detail-book-btn">
                Đặt vé ngay
              </Link>
            ) : (
              <Link to="/login" className="movie-detail-book-btn movie-detail-book-btn--login">
                Đăng nhập để đặt vé
              </Link>
            )}
          </div>
        </div>

        <section className="review-section">
          <h2>Đánh giá & Phản hồi</h2>

          {user ? (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <label>Điểm đánh giá của bạn</label>
              <StarRating value={rating} onChange={setRating} />
              <label htmlFor="review-comment">Nội dung phản hồi</label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận về bộ phim..."
                rows={4}
                required
              />
              {reviewError && <div className="movie-detail-alert">{reviewError}</div>}
              {reviewSuccess && <div className="movie-detail-success">{reviewSuccess}</div>}
              <button type="submit" disabled={submitting || !comment.trim()}>
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          ) : (
            <p className="review-login-hint">
              <Link to="/login">Đăng nhập</Link> để viết đánh giá và phản hồi.
            </p>
          )}

          <div className="review-list">
            {reviews.length === 0 ? (
              <p className="review-empty">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            ) : (
              reviews.map((review) => (
                <article key={review._id} className="review-card">
                  <div className="review-card__header">
                    <strong>{review.user.name}</strong>
                    <StarRating value={review.rating} readonly />
                  </div>
                  <p className="review-card__comment">{review.comment}</p>
                  <time className="review-card__date">{formatDate(review.createdAt)}</time>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
