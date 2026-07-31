import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../../components/admin/Card";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalMovies: 0,
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0,
    });
    const [recentBookings, setRecentBookings] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user") || "{}").token;
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const statsRes = await axios.get("/api/bookings/stats", config);
                setStats(statsRes.data);

                const bookingsRes = await axios.get("/api/bookings", config);
                setRecentBookings(bookingsRes.data.slice(0, 5));
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <>
            <div className="dashboard">
                <Card
                    title="Movies"
                    total={stats.totalMovies}
                    color="#2563eb"
                />

                <Card
                    title="Users"
                    total={stats.totalUsers}
                    color="#16a34a"
                />

                <Card
                    title="Bookings"
                    total={stats.totalBookings}
                    color="#dc2626"
                />

                <Card
                    title="Revenue"
                    total={stats.totalRevenue}
                    color="#ca8a04"
                />
            </div>

            <div className="dashboard-table">
                <div className="box">
                    <h2>Recent Bookings</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Movie</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center">No recent bookings</td>
                                </tr>
                            ) : (
                                recentBookings.map((b) => (
                                    <tr key={b._id}>
                                        <td>{b.user?.name || b.user?.email || "Unknown User"}</td>
                                        <td>{b.showtime?.movie?.title || "Unknown Movie"}</td>
                                        <td>
                                            <span className={b.status === "confirmed" ? "success" : b.status === "cancelled" ? "cancelled" : "pending"}>
                                                {b.status === "confirmed" ? "Success" : b.status === "cancelled" ? "Cancelled" : "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
