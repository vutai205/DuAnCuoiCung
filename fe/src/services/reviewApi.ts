import { apiClient } from './apiClient';
import type { MovieReviewsResponse, Review } from '../types/review';

export const getMovieReviews = async (movieId: string): Promise<MovieReviewsResponse> => {
  const { data } = await apiClient.get<MovieReviewsResponse>(`/api/reviews/movie/${movieId}`);
  return data;
};

export const createReview = async (
  movieId: string,
  rating: number,
  comment: string
): Promise<Review> => {
  const { data } = await apiClient.post<Review>('/api/reviews', {
    movieId,
    rating,
    comment,
  });
  return data;
};
