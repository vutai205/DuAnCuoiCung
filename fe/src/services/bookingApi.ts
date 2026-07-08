import { apiClient } from './apiClient';
import type { Booking, Room, Showtime, ShowtimeSeatsResponse } from '../types/booking';

export const getRooms = async (): Promise<Room[]> => {
  const { data } = await apiClient.get<Room[]>('/api/rooms');
  return data;
};

export const getShowtimesByMovie = async (movieId: string): Promise<Showtime[]> => {
  const { data } = await apiClient.get<Showtime[]>(`/api/showtimes/movie/${movieId}`);
  return data;
};

export const getShowtimeSeats = async (showtimeId: string): Promise<ShowtimeSeatsResponse> => {
  const { data } = await apiClient.get<ShowtimeSeatsResponse>(`/api/showtimes/${showtimeId}/seats`);
  return data;
};

export const createBooking = async (showtimeId: string, seats: string[]): Promise<Booking> => {
  const { data } = await apiClient.post<Booking>('/api/bookings', { showtimeId, seats });
  return data;
};
