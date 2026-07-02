import axios from "axios";
import { Movie } from "../types/Movie";

const API = "http://localhost:3000/api/movies";

export const getMovies = () => axios.get(API);

export const getMovie = (id: string) =>
  axios.get(`${API}/${id}`);

export const addMovie = (movie: Movie) =>
  axios.post(API, movie);

export const updateMovie = (
  id: string,
  movie: Movie
) =>
  axios.put(`${API}/${id}`, movie);

export const deleteMovie = (id: string) =>
  axios.delete(`${API}/${id}`);
