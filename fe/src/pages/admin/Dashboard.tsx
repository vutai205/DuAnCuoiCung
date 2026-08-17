import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Card from "../../components/admin/Card";
import { getAuthUser } from "../../services/authApi";

const Dashboard = () => {
    const user = getAuthUser();
    const isStaff = user?.role === 'staff';

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
                const config = token ? {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                } : {};

                const [statsRes, bookingsRes] = await Promise.all([
                    axios.get("/api/bookings/stats", config).catch(err => {
                        console.error("Stats API error:", err);
                        return { data: null };
                    }),
                    axios.get("/api/bookings", config).catch(err => {
                        console.error("Bookings API error:", err);
                        return { data: [] };
                    })
                ]);

                if (statsRes.data) {
                    setStats(statsRes.data);
                }
                if (Array.isArray(bookingsRes.data)) {
                    setRecentBookings(bookingsRes.data.slice(0, 5));
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu tổng quan:", err);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <>
            <div style={{
                marginBottom: '20px',
                padding: '16px 20px',
                backgroundColor: isStaff ? '#0284c7' : '#4f46e5',
                color: '#fff',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                        👋 Xin chào, {user?.name || "Người dùng"}!
                    </h2>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                        {isStaff 
                            ? '🎫 Quyền hạn: Nhân viên Quầy / Soát vé — Chuyên trách Check-in QR và In vé cứng.' 
                            : '👑 Quyền hạn: Quản trị viên (Admin) — Toàn quyền quản trị hệ thống rạp.'}
                    </p>
                </div>
                {isStaff && (
                    <Link 
                        to="/admin/bookings" 
                        style={{
                            backgroundColor: '#fff',
                            color: '#0284c7',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            fontSize: '14px'
                        }}
                    >
                        🎟️ Đi Đến Trang Soát Vé & In Vé
                    </Link>
                )}
            </div>

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
