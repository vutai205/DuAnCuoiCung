import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./app/components/Header/Header";
import Footer from "./app/components/Footer/Footer";

import Profile from "./app/pages/Profile/Profile";
import MemberCard from "./app/pages/Profile/MemberCard";


function App() {

  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/member-card" element={<MemberCard />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App
