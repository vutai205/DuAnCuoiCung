import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./app/pages/admin/AdminLayout";
import Dashboard from "./app/pages/admin/Dashboard";

import Header from "./app/components/Header/Header";
import Footer from "./app/components/Footer/Footer";

import Profile from "./app/pages/Profile/Profile";
import MemberCard from "./app/pages/Profile/MemberCard";

import FoodList from "./app/pages/admin/Food/FoodList";
import CustomerList from "./app/pages/admin/Customer/CustomerList";
import BookingList from "./app/pages/admin/Booking/BookingList";

function App() {

  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="foods" element={<FoodList />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="bookings" element={<BookingList />} />
      </Route>
        <Route path="/" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/member-card" element={<MemberCard />} />
        
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App
