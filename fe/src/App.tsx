import { Routes, Route, Link } from "react-router-dom";
import MoviesPage from "./pages/MoviesPage";
function Home() {
  return (
    <div>
      <h1>CineTicket</h1>
      <Link to="/movies">Xem phim</Link>
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<MoviesPage />} />
    </Routes>
  );
}
