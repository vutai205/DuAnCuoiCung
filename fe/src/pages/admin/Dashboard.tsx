import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Card from "../../components/admin/Card";
import { getAuthUser } from "../../services/authApi";

interface DailyData {
    key: string;
    dateLabel: string;
    revenue: number;
    bookings: number;
    seats: number;
}

interface MonthlyData {
    key: string;
    monthLabel: string;
    revenue: number;
    bookings: number;
}

interface TopMovie {
    _id: string;
    title: string;
    poster: string;
    totalRevenue: number;
    totalTickets: number;
    totalBookings: number;
}

const Dashboard = () => {
    const user = getAuthUser();
    const isStaff = user?.role === 'staff';

    const [stats, setStats] = useState({
        totalMovies: 0,
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        todayBookings: 0,
        monthRevenue: 0,
        monthBookings: 0,
        dailyRevenue: [] as DailyData[],
        monthlyRevenue: [] as MonthlyData[],
        paymentStats: {
            vnpayRevenue: 0,
            vnpayCount: 0,
            cashRevenue: 0,
            cashCount: 0
        },
        topMovies: [] as TopMovie[]
    });

    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [chartMode, setChartMode] = useState<'daily' | 'monthly'>('daily');

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
                    setStats(prev => ({ ...prev, ...statsRes.data }));
                }
                if (Array.isArray(bookingsRes.data)) {
                    setRecentBookings(bookingsRes.data.slice(0, 7));
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu tổng quan:", err);
            }
        };

        fetchDashboardData();
    }, []);

    const formatVND = (num: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num || 0);
    };

    // Calculate max revenue for chart scaling
    const chartList = chartMode === 'daily' ? stats.dailyRevenue : stats.monthlyRevenue;
    const maxRev = Math.max(...(chartList.map(item => item.revenue) || [1]), 100000);

    const totalPaymentRev = (stats.paymentStats?.vnpayRevenue || 0) + (stats.paymentStats?.cashRevenue || 0) || 1;
    const vnpayPercent = Math.round(((stats.paymentStats?.vnpayRevenue || 0) / totalPaymentRev) * 100);
    const cashPercent = 100 - vnpayPercent;

    return (
        <div style={{ paddingBottom: 40 }}>
            {/* Header Banner */}
            <div style={{
                marginBottom: '25px',
                padding: '22px 28px',
                background: isStaff 
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                    : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: '#fff',
                borderRadius: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.15)'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span>👋</span> Xin chào, {user?.name || "Người dùng"}!
                    </h2>
                    <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                        {isStaff 
                            ? '🎫 Quyền hạn: Nhân viên Quầy / Soát vé — Chuyên trách Check-in QR và In vé cứng.' 
                            : '👑 Quyền hạn: Quản trị viên (Admin) — Báo cáo doanh thu & Quản trị hệ thống rạp phim TNA Cinema.'}
                    </p>
                </div>
                {isStaff ? (
                    <Link 
                        to="/admin/bookings" 
                        style={{
                            backgroundColor: '#fff',
                            color: '#0284c7',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            fontSize: '14px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        🎟️ Đi Đến Trang Soát Vé
                    </Link>
                ) : (
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link 
                            to="/admin/vouchers" 
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: '#fff',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                fontSize: '13px',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}
                        >
                            ⚡ Phát Voucher
                        </Link>
                        <Link 
                            to="/admin/movies/add" 
                            style={{
                                backgroundColor: '#fff',
                                color: '#4f46e5',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                fontSize: '13px'
                            }}
                        >
                            🎬 Thêm Phim Mới
                        </Link>
                    </div>
                )}
            </div>

            {/* Top 4 KPI Cards - Strictly Equal Height */}
            <div className="dashboard" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '20px',
                alignItems: 'stretch',
                marginBottom: '30px'
            }}>
                <Card
                    title="Doanh Thu Hôm Nay"
                    total={stats.todayRevenue || 0}
                    color="#10b981"
                    icon="💰"
                    subtitle={`Hôm nay: ${stats.todayBookings || 0} đơn vé`}
                    trend="+Hôm nay"
                />

                <Card
                    title="Doanh Thu Tháng Này"
                    total={stats.monthRevenue || 0}
                    color="#0284c7"
                    icon="📈"
                    subtitle={`Tháng 8: ${stats.monthBookings || 0} đơn`}
                    trend="Tháng hiện tại"
                />

                <Card
                    title="Tổng Doanh Thu Lũy Kế"
                    total={stats.totalRevenue || 0}
                    color="#8b5cf6"
                    icon="💎"
                    subtitle={`Toàn bộ hệ thống TNA`}
                    trend="Tổng tích lũy"
                />

                <Card
                    title="Tổng Đơn Vé & Khách"
                    total={`${stats.totalBookings} đơn`}
                    color="#f59e0b"
                    icon="🎟️"
                    subtitle={`${stats.totalMovies} phim • ${stats.totalUsers} khách`}
                    trend="Đã đặt chỗ"
                />
            </div>

            {/* Interactive Revenue Chart Section */}
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '25px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                marginBottom: '30px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: 12
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>📊</span> Biểu Đồ Thống Kê Doanh Thu
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                            Theo dõi sự thay đổi doanh thu thực tế theo chu kỳ ngày và tháng
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setChartMode('daily')}
                            style={{
                                padding: '6px 14px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: chartMode === 'daily' ? '#ffffff' : 'transparent',
                                color: chartMode === 'daily' ? '#4f46e5' : '#64748b',
                                boxShadow: chartMode === 'daily' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                            }}
                        >
                            📅 7 Ngày Gần Đây
                        </button>
                        <button
                            type="button"
                            onClick={() => setChartMode('monthly')}
                            style={{
                                padding: '6px 14px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: chartMode === 'monthly' ? '#ffffff' : 'transparent',
                                color: chartMode === 'monthly' ? '#4f46e5' : '#64748b',
                                boxShadow: chartMode === 'monthly' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                            }}
                        >
                            🗓️ 6 Tháng Gần Nhất
                        </button>
                    </div>
                </div>

                {/* Custom Bar Chart Visualizer */}
                <div style={{
                    height: '240px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '16px',
                    paddingTop: '30px',
                    borderBottom: '2px dashed #e2e8f0',
                    paddingBottom: '10px'
                }}>
                    {chartList.map((item: any, idx) => {
                        const heightPercent = maxRev > 0 ? Math.max(12, Math.round((item.revenue / maxRev) * 100)) : 12;
                        const label = chartMode === 'daily' ? item.dateLabel : item.monthLabel;

                        return (
                            <div key={idx} style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                height: '100%',
                                justifyContent: 'flex-end',
                                position: 'relative'
                            }}>
                                {/* Tooltip value */}
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    color: item.revenue > 0 ? '#4f46e5' : '#94a3b8',
                                    marginBottom: '6px',
                                    textAlign: 'center'
                                }}>
                                    {item.revenue > 0 ? formatVND(item.revenue) : '0 đ'}
                                </span>

                                {/* Bar shape */}
                                <div style={{
                                    width: '100%',
                                    maxWidth: '48px',
                                    height: `${heightPercent}%`,
                                    background: item.revenue > 0 
                                        ? 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)' 
                                        : '#e2e8f0',
                                    borderRadius: '8px 8px 0 0',
                                    transition: 'height 0.5s ease',
                                    boxShadow: item.revenue > 0 ? '0 4px 10px rgba(99, 102, 241, 0.25)' : 'none'
                                }}></div>

                                {/* Date / Month Label */}
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#475569',
                                    marginTop: '10px'
                                }}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Analytics Grid: Top Movies & Payment Breakdown */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '25px',
                marginBottom: '30px'
            }}>
                {/* Top Movies */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🏆</span> Top Phim Doanh Thu Cao Nhất
                    </h3>

                    {stats.topMovies && stats.topMovies.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stats.topMovies.map((m, index) => (
                                <div key={m._id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px',
                                    background: '#f8fafc',
                                    borderRadius: '10px',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{
                                            fontWeight: 800,
                                            fontSize: '14px',
                                            color: index === 0 ? '#eab308' : index === 1 ? '#94a3b8' : '#b45309',
                                            width: 20
                                        }}>
                                            #{index + 1}
                                        </span>
                                        {m.poster && (
                                            <img
                                                src={m.poster}
                                                alt={m.title}
                                                style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 4 }}
                                            />
                                        )}
                                        <div>
                                            <strong style={{ display: 'block', fontSize: '13px', color: '#1e293b' }}>
                                                {m.title}
                                            </strong>
                                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                {m.totalTickets} vé • {m.totalBookings} đơn
                                            </span>
                                        </div>
                                    </div>
                                    <strong style={{ fontSize: '13px', color: '#10b981' }}>
                                        {formatVND(m.totalRevenue)}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, textAlign: 'center', padding: '20px 0' }}>
                            Chưa có dữ liệu thống kê phim
                        </p>
                    )}
                </div>

                {/* Payment Breakdown */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>💳</span> Thống Kê Phương Thức Thanh Toán
                        </h3>

                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: 6 }}>
                                <span>🌐 VNPay Online ({vnpayPercent}%)</span>
                                <strong>{formatVND(stats.paymentStats?.vnpayRevenue || 0)}</strong>
                            </div>
                            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${vnpayPercent}%`, background: '#2563eb', borderRadius: 5 }}></div>
                            </div>
                            <span style={{ fontSize: '11px', color: '#64748b', marginTop: 4, display: 'block' }}>
                                Total: {stats.paymentStats?.vnpayCount || 0} giao dịch thành công
                            </span>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: 6 }}>
                                <span>💵 Tiền Mặt Tại Quầy ({cashPercent}%)</span>
                                <strong>{formatVND(stats.paymentStats?.cashRevenue || 0)}</strong>
                            </div>
                            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${cashPercent}%`, background: '#10b981', borderRadius: 5 }}></div>
                            </div>
                            <span style={{ fontSize: '11px', color: '#64748b', marginTop: 4, display: 'block' }}>
                                Total: {stats.paymentStats?.cashCount || 0} giao dịch trực tiếp
                            </span>
                        </div>
                    </div>

                    <div style={{
                        marginTop: 20,
                        padding: '12px 16px',
                        background: '#eff6ff',
                        borderRadius: '10px',
                        border: '1px solid #bfdbfe',
                        fontSize: '12px',
                        color: '#1e40af'
                    }}>
                        💡 <strong>Mẹo vận hành:</strong> Thanh toán qua VNPay-QR giúp giảm thời gian chờ tại quầy vé lên tới 80%!
                    </div>
                </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="dashboard-table" style={{ marginTop: 0 }}>
                <div className="box" style={{ borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>📋</span> Đơn Đặt Vé Mới Nhất
                        </h2>
                        <Link to="/admin/bookings" style={{ fontSize: '13px', fontWeight: 600, color: '#4f46e5', textDecoration: 'none' }}>
                            Xem toàn bộ đơn vé →
                        </Link>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Khách Hàng</th>
                                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Bộ Phim</th>
                                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Ghế & Tổng Tiền</th>
                                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Thanh Toán</th>
                                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center" style={{ padding: 25, color: '#94a3b8' }}>
                                        Chưa có đơn đặt vé nào gần đây
                                    </td>
                                </tr>
                            ) : (
                                recentBookings.map((b) => (
                                    <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <strong style={{ display: 'block', fontSize: '13px', color: '#1e293b' }}>
                                                {b.user?.name || "Khách vãng lai"}
                                            </strong>
                                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                {b.user?.email || b.user?.phone || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                            {b.showtime?.movie?.title || "Phim chưa xác định"}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                                                Ghế: {b.seats ? b.seats.join(', ') : 'N/A'}
                                            </span>
                                            <strong style={{ fontSize: '13px', color: '#10b981' }}>
                                                {formatVND(b.totalPrice)}
                                            </strong>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                background: b.paymentMethod === 'vnpay' ? '#dbeafe' : '#fef3c7',
                                                color: b.paymentMethod === 'vnpay' ? '#1d4ed8' : '#b45309'
                                            }}>
                                                {b.paymentMethod === 'vnpay' ? 'VNPay Online' : 'Tiền mặt tại quầy'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span className={b.status === "confirmed" ? "success" : b.status === "cancelled" ? "cancelled" : "pending"}
                                                  style={{ fontSize: '12px', fontWeight: 600 }}>
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
        </div>
    );
};

export default Dashboard;
