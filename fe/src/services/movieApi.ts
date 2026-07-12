import axios from 'axios';
import type { Movie, MovieFilters } from '../types/movie';
const api = axios.create({
  baseURL: '/api/movies',
  headers: { 'Content-Type': 'application/json' },
});
export const getMovieById = async (id: string): Promise<Movie> => {
  const { data } = await api.get<Movie>(`/${id}`);
  return data;
};

export const getMovies = async (filters: MovieFilters = {}): Promise<Movie[]> => {
  const params: Record<string, string> = {};
  if (filters.ageRating) {
    params.ageRating = filters.ageRating;
  }
  if (filters.viewerAge !== undefined && filters.viewerAge !== '') {
    params.viewerAge = String(filters.viewerAge);
  }
  const { data } = await api.get<Movie[]>('/', { params });
  return data;
};
