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
                console.error("Lỗi khi tải dữ liệu tổng quan:", err);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <>
            <div className="dashboard">
                <Card
                    title="Tổng Số Phim"
                    total={stats.totalMovies}
                    color="#2563eb"
                />

                <Card
                    title="Người Dùng & Khách Hàng"
                    total={stats.totalUsers}
                    color="#16a34a"
                />

                <Card
                    title="Tổng Số Đơn Vé"
                    total={stats.totalBookings}
                    color="#dc2626"
                />

                <Card
                    title="Tổng Doanh Thu"
                    total={stats.totalRevenue ? stats.totalRevenue.toLocaleString("vi-VN") + " đ" : "0 đ"}
                    color="#ca8a04"
                />
            </div>

            <div className="dashboard-table">
                <div className="box">
                    <h2>Đơn Đặt Vé Mới Nhất</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Khách Hàng</th>
                                <th>Bộ Phim</th>
                                <th>Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center">Chưa có đơn đặt vé nào gần đây</td>
                                </tr>
                            ) : (
                                recentBookings.map((b) => (
                                    <tr key={b._id}>
                                        <td>{b.user?.name || b.user?.email || "Khách vãng lai"}</td>
                                        <td>{b.showtime?.movie?.title || "Phim chưa xác định"}</td>
                                        <td>
                                            <span className={b.status === "confirmed" ? "success" : b.status === "cancelled" ? "cancelled" : "pending"}>
                                                {b.status === "confirmed" ? "Thành công" : b.status === "cancelled" ? "Đã hủy" : "Chờ xử lý"}
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
