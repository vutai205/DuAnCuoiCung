import axios from "axios";
import { Movie } from "../types/Movie";

const API = "/api/movies";

const getToken = () => {
  const token = localStorage.getItem("token");
  if (token) return token;
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user?.token || "";
};

const config = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

export const getMovies = () => axios.get(API);

export const getMovie = (id: string) =>
  axios.get(`${API}/${id}`);

export const addMovie = (movie: Movie) =>
  axios.post(API, movie, config());

export const updateMovie = (
  id: string,
  movie: Movie
) =>
  axios.put(`${API}/${id}`, movie, config());

export const deleteMovie = (id: string) =>
  axios.delete(`${API}/${id}`, config());
