import type { Movie } from './movie';

export interface Room {
  _id: string;
  name: string;
  totalSeats: number;
  seatLayout: string[];
}

export interface Showtime {
  _id: string;
  movie: string | Movie;
  room: Room;
  startTime: string;
  endTime: string;
  ticketPrice: number;
}

export interface SeatStatus {
  seatName: string;
  isBooked: boolean;
}

export interface ShowtimeSeatsResponse {
  showtimeId: string;
  room: string;
  ticketPrice: number;
  seats: SeatStatus[];
}

export interface Booking {
  _id: string;
  showtime: string;
  seats: string[];
  totalPrice: number;
  status: string;
}
