import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  Descriptions,
  message,
  QRCode,
  Alert,
  Radio,
  Tooltip,
  Dropdown,
} from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";

interface Booking {
  _id: string;
  ticketCode?: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  showtime: {
    _id: string;
    movie: {
      _id: string;
      title: string;
    } | null;
    room: {
      _id: string;
      name: string;
    } | null;
    startTime: string;
  } | null;
  seats: string[];
  combos?: { name: string; count: number; price: number }[];
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkInCancelReason?: string;
  checkInCancelledAt?: string;
  isPrinted?: boolean;
  printedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [detail, setDetail] = useState<Booking | null>(null);
  const [printing, setPrinting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Single item print target (null = print ALL stubs)
  const [printTargetItem, setPrintTargetItem] = useState<any | null>(null);

  // Cancel Check-in states
  const [cancelCheckinModalOpen, setCancelCheckinModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState<string>("Khách nhầm suất chiếu / nhầm rạp");
  const [customCancelReason, setCustomCancelReason] = useState<string>("");
  const [submittingCancelCheckin, setSubmittingCancelCheckin] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user") || "{}").token;
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/bookings", getHeaders());
      setBookings(res.data);
    } catch {
      message.error("Không lấy được danh sách vé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleOpenDetail = (record: Booking) => {
    setPrintTargetItem(null); // Reset print target when opening modal
    setDetail(record);
  };

  // Live Camera Scanner Hook
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    if (isCameraOpen) {
      const timer = setTimeout(() => {
        html5QrCode = new Html5Qrcode("camera-reader");
        html5QrCode
          .start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
              if (html5QrCode) {
                html5QrCode
                  .stop()
                  .then(() => {
                    setIsCameraOpen(false);
                    handleScanOrSearchQR(decodedText);
                  })
                  .catch(console.error);
              }
            },
            () => {}
          )
          .catch((err) => {
            console.error("Camera error:", err);
            message.error("Không thể mở Camera. Hãy cấp quyền truy cập Camera cho trình duyệt!");
          });
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch(console.error);
        }
      };
    }
  }, [isCameraOpen]);

  const handleScanOrSearchQR = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/bookings/${code.trim()}`, getHeaders());
      if (res.data) {
        handleOpenDetail(res.data);
        message.success("Đã tìm thấy thông tin vé!");
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || "Không tìm thấy mã vé này trong hệ thống!");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      await axios.put(`/api/bookings/${id}/status`, { status: "cancelled" }, getHeaders());
      message.success("Hủy vé thành công");
      loadBookings();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra khi hủy vé");
    }
  };

  // Build array of individual ticket & combo stubs for a booking
  const getBookingTicketStubs = (booking: Booking) => {
    if (!booking) return [];
    const stubs: any[] = [];

    const totalComboPrice = (booking.combos || []).reduce((sum, c) => sum + (c.price * c.count), 0);
    const totalSeatPrice = Math.max(0, booking.totalPrice - totalComboPrice);
    const seatCount = booking.seats?.length || 1;
    const perSeatPrice = Math.round(totalSeatPrice / seatCount);

    const roomSeatLayout = (booking.showtime?.room as any)?.seatLayout || [];
    const getSeatType = (seatName: string) => {
      const found = roomSeatLayout.find((s: any) => s.seatName === seatName);
      return found ? found.type : null;
    };

    const seatsList = [...(booking.seats || [])];
    const processedSeats = new Set<string>();

    // 1. Group seats: Couple seat pairs (e.g. G1 & G2) are merged into 1 ticket stub!
    seatsList.forEach((seatName) => {
      if (processedSeats.has(seatName)) return;

      const match = seatName.match(/^([A-Z]+)(\d+)$/);
      const rowLetter = match ? match[1] : '';
      const seatNum = match ? parseInt(match[2], 10) : 0;
      const seatType = getSeatType(seatName);

      // Check if this seat is a couple seat
      const isCoupleType = seatType === 'couple' || seatName.includes('SWEET') || seatType === 'sweetbox';

      if (isCoupleType && match) {
        // Find adjacent pair in same row (1-2, 3-4, 5-6, 7-8...)
        const pairNum = seatNum % 2 !== 0 ? seatNum + 1 : seatNum - 1;
        const pairSeatName = `${rowLetter}${pairNum}`;

        if (seatsList.includes(pairSeatName) && !processedSeats.has(pairSeatName)) {
          // Found couple pair! Merge into 1 single Ticket Stub
          processedSeats.add(seatName);
          processedSeats.add(pairSeatName);

          const sortedPair = [seatName, pairSeatName].sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''), 10);
            const numB = parseInt(b.replace(/\D/g, ''), 10);
            return numA - numB;
          });

          const pairLabel = sortedPair.join(' & ');

          stubs.push({
            id: `seat_couple_${sortedPair.join('_')}`,
            subCode: sortedPair.join('-'),
            type: 'seat',
            icon: '💕',
            title: `Vé Ghế Đôi (Couple) - Ghế ${pairLabel}`,
            seatName: pairLabel,
            isCouple: true,
            movieTitle: booking.showtime?.movie?.title || 'Phim chiếu tại rạp',
            roomName: booking.showtime?.room?.name || 'Phòng chiếu',
            startTime: booking.showtime?.startTime,
            price: perSeatPrice * 2,
            customerName: booking.user?.name || 'Khách vãng lai',
            customerPhone: booking.user?.phone || 'Chưa cập nhật',
            ticketCode: booking.ticketCode || booking._id.slice(-8).toUpperCase()
          });
          return;
        }
      }

      // Single seat stub (Regular / VIP)
      processedSeats.add(seatName);
      stubs.push({
        id: `seat_${seatName}`,
        subCode: seatName,
        type: 'seat',
        icon: '🎟️',
        title: `Vé Ghế Xem Phim - Ghế ${seatName}`,
        seatName: seatName,
        isCouple: false,
        movieTitle: booking.showtime?.movie?.title || 'Phim chiếu tại rạp',
        roomName: booking.showtime?.room?.name || 'Phòng chiếu',
        startTime: booking.showtime?.startTime,
        price: perSeatPrice,
        customerName: booking.user?.name || 'Khách vãng lai',
        customerPhone: booking.user?.phone || 'Chưa cập nhật',
        ticketCode: booking.ticketCode || booking._id.slice(-8).toUpperCase()
      });
    });

    // 2. Combo food vouchers (Each combo item is a separate food voucher)
    (booking.combos || []).forEach((combo, cIdx) => {
      for (let i = 1; i <= combo.count; i++) {
        stubs.push({
          id: `combo_${cIdx}_${i}`,
          subCode: `F&B-${cIdx + 1}.${i}`,
          type: 'combo',
          icon: '🍿',
          title: `Phiếu Bỏng Nước: ${combo.name} (${i}/${combo.count})`,
          comboName: combo.name,
          price: combo.price,
          customerName: booking.user?.name || 'Khách vãng lai',
          customerPhone: booking.user?.phone || 'Chưa cập nhật',
          ticketCode: booking.ticketCode || booking._id.slice(-8).toUpperCase()
        });
      }
    });

    return stubs;
  };

  // Print ALL ticket stubs together
  const handlePrintTicket = async (record: Booking) => {
    const isUnpaidVnpay = (record.paymentMethod === 'vnpay' || !record.paymentMethod) && record.paymentStatus !== 'paid' && record.status === 'pending';
    if (isUnpaidVnpay) {
      message.error("⚠️ Khách chưa hoàn tất thanh toán VNPay Online! Không thể in vé.");
      return;
    }

    if (record.isPrinted) {
      message.warning(`Vé này đã được in lúc ${new Date(record.printedAt!).toLocaleString("vi-VN")}. Không thể in lại!`);
      return;
    }

    setPrintTargetItem(null); // Ensure printing ALL stubs
    setPrinting(true);
    try {
      const res = await axios.put(`/api/bookings/${record._id}/print`, {}, getHeaders());
      message.success("Đã xác nhận in TẤT CẢ vé & phiếu cho khách thành công!");
      
      const updatedBooking = res.data.booking;
      loadBookings();
      if (detail && detail._id === record._id) {
        setDetail(updatedBooking);
      }

      setTimeout(() => {
        window.print();
      }, 300);
    } catch (err: any) {
      if (err.response?.data?.printedAt) {
        message.error(`⚠️ Vé đã được in lúc ${new Date(err.response.data.printedAt).toLocaleString("vi-VN")}`);
      } else {
        message.error(err.response?.data?.message || "Lỗi khi thực hiện in vé!");
      }
    } finally {
      setPrinting(false);
    }
  };

  // Print single individual ticket/combo stub
  const handlePrintSingleItem = async (record: Booking, stubItem: any) => {
    const isUnpaidVnpay = (record.paymentMethod === 'vnpay' || !record.paymentMethod) && record.paymentStatus !== 'paid' && record.status === 'pending';
    if (isUnpaidVnpay) {
      message.error("⚠️ Khách chưa hoàn tất thanh toán VNPay Online! Không thể in vé.");
      return;
    }

    setPrintTargetItem(stubItem);
    setPrinting(true);
    try {
      const res = await axios.put(`/api/bookings/${record._id}/print`, {}, getHeaders());
      message.success(`Đã in hóa đơn/cuống lẻ: ${stubItem.title}!`);
      
      const updatedBooking = res.data.booking;
      loadBookings();
      if (detail && detail._id === record._id) {
        setDetail(updatedBooking);
      }

      setTimeout(() => {
        window.print();
      }, 300);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi khi in cuống vé lẻ!");
    } finally {
      setPrinting(false);
    }
  };

  const handleCheckin = async (record: Booking) => {
    const isUnpaidVnpay = (record.paymentMethod === 'vnpay' || !record.paymentMethod) && record.paymentStatus !== 'paid' && record.status === 'pending';
    if (isUnpaidVnpay) {
      message.error("⚠️ Khách chưa hoàn tất thanh toán VNPay Online! Không thể Check-in.");
      return;
    }

    try {
      await axios.put(`/api/bookings/${record._id}/checkin`, {}, getHeaders());
      message.success("Check-in vé thành công");
      loadBookings();
      if (detail && detail._id === record._id) {
        setDetail((prev) => prev ? { ...prev, isCheckedIn: true, status: "confirmed", paymentStatus: "paid" } : null);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra khi check-in");
    }
  };

  const handleOpenCancelCheckinModal = (record: Booking) => {
    setSelectedBookingForCancel(record);
    setCancelReasonPreset("Khách nhầm suất chiếu / nhầm rạp");
    setCustomCancelReason("");
    setCancelCheckinModalOpen(true);
  };

  const handleConfirmCancelCheckin = async () => {
    if (!selectedBookingForCancel) return;

    const finalReason = cancelReasonPreset === "custom" 
      ? customCancelReason.trim() 
      : cancelReasonPreset;

    if (!finalReason) {
      message.error("Vui lòng cung cấp lý do hủy Check-in!");
      return;
    }

    setSubmittingCancelCheckin(true);
    try {
      const res = await axios.put(
        `/api/bookings/${selectedBookingForCancel._id}/cancel-checkin`,
        { reason: finalReason },
        getHeaders()
      );
      message.success("Đã hủy Check-in vé thành công!");
      setCancelCheckinModalOpen(false);
      loadBookings();

      const updated = res.data;
      if (detail && detail._id === selectedBookingForCancel._id) {
        setDetail(updated);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra khi hủy check-in!");
    } finally {
      setSubmittingCancelCheckin(false);
    }
  };

  const columns = [
    {
      title: "Mã vé / QR Code",
      dataIndex: "ticketCode",
      width: 165,
      render: (ticketCode: string, record: Booking) => (
        <div style={{ whiteSpace: "nowrap" }}>
          <code style={{ fontWeight: "bold", color: "#e50914", fontSize: "13px" }}>
            #{ticketCode || record._id.substring(record._id.length - 8).toUpperCase()}
          </code>
          {record.isPrinted && (
            <div style={{ marginTop: 2 }}>
              <Tag color="purple" style={{ margin: 0 }}>
                🖨️ Đã in vé
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Khách hàng",
      width: 125,
      render: (_: any, record: Booking) => (
        <div style={{ whiteSpace: "nowrap" }}>
          <strong style={{ display: "block" }}>{record.user?.name || "Khách vãng lai"}</strong>
          {record.user?.phone && <div style={{ fontSize: "0.8rem", color: "#888" }}>📱 {record.user.phone}</div>}
        </div>
      ),
    },
    {
      title: "Phim",
      width: 145,
      render: (_: any, record: Booking) => {
        const title = record.showtime?.movie?.title;
        if (title) {
          return (
            <div style={{ fontWeight: 600, color: "#1890ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={title}>
              {title}
            </div>
          );
        }
        return <Tag color="default">Phim đã tháo lịch</Tag>;
      },
    },
    {
      title: "Suất chiếu",
      width: 120,
      align: "center" as const,
      render: (_: any, record: Booking) => {
        if (!record.showtime?.startTime) {
          return <Tag color="default">Lịch chiếu đã gỡ</Tag>;
        }
        const dt = new Date(record.showtime.startTime);
        return (
          <div style={{ whiteSpace: "nowrap", fontSize: "13px" }}>
            <div style={{ fontWeight: "bold", color: "#333" }}>
              {dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              {dt.toLocaleDateString("vi-VN")}
            </div>
          </div>
        );
      },
    },
    {
      title: "Ghế",
      dataIndex: "seats",
      width: 110,
      align: "center" as const,
      render: (seats: string[]) => (
        <div style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
          <strong style={{ color: "#ff9800" }}>{seats?.join(", ")}</strong>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      width: 110,
      align: "right" as const,
      render: (value: number) => (
        <div style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
          {value ? value.toLocaleString("vi-VN") + " đ" : "0 đ"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 145,
      align: "center" as const,
      render: (status: string, record: Booking) => {
        const isUnpaidVnpay = (record.paymentMethod === 'vnpay' || !record.paymentMethod) && record.paymentStatus !== 'paid' && record.status === 'pending';
        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Tag
              color={
                status === "confirmed"
                  ? "green"
                  : status === "cancelled"
                  ? "red"
                  : isUnpaidVnpay
                  ? "volcano"
                  : "orange"
              }
              style={{ margin: 0 }}
            >
              {status === "confirmed"
                ? record.paymentMethod === 'cash' ? "Thanh toán tại quầy" : "Thành công (VNPay)"
                : status === "cancelled"
                ? "Đã hủy (Hết hạn)"
                : "Chờ TT VNPay (Giữ 5p)"}
            </Tag>
            {record.isCheckedIn ? (
              <Tag color="cyan" style={{ margin: 0 }}>✓ Đã Check-in</Tag>
            ) : record.checkInCancelReason ? (
              <Tooltip title={`Lý do hủy: ${record.checkInCancelReason}${record.checkInCancelledAt ? ` (${new Date(record.checkInCancelledAt).toLocaleString('vi-VN')})` : ''}`}>
                <Tag color="volcano" style={{ cursor: 'pointer', margin: 0 }}>⚠️ Đã Hủy Check-in</Tag>
              </Tooltip>
            ) : (
              <Tag color="blue" style={{ margin: 0 }}>Chưa Check-in</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Thao tác",
      width: 155,
      align: "center" as const,
      render: (_: any, record: Booking) => {
        const isUnpaidVnpay = (record.paymentMethod === 'vnpay' || !record.paymentMethod) && record.paymentStatus !== 'paid' && record.status === 'pending';

        const menuItems: MenuProps['items'] = [
          {
            key: 'print',
            label: record.isPrinted ? "🖨️ Vé đã được in" : isUnpaidVnpay ? "🔒 Chưa thanh toán VNPay" : "🖨️ In tất cả vé xem phim",
            disabled: record.isPrinted || record.status === "cancelled" || isUnpaidVnpay,
          },
          {
            type: 'divider',
          },
          record.isCheckedIn ? {
            key: 'cancel-checkin',
            label: "⚠️ Hủy Check-in vé này",
            danger: true,
          } : {
            key: 'checkin',
            label: "✅ Soát vé (Check-in)",
            disabled: record.status === "cancelled" || isUnpaidVnpay,
          },
          {
            type: 'divider',
          },
          record.status !== "cancelled" ? {
            key: 'cancel-ticket',
            label: "🚫 Hủy toàn bộ vé này",
            danger: true,
          } : null,
        ].filter(Boolean) as MenuProps['items'];

        const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
          if (key === 'print') {
            handlePrintTicket(record);
          } else if (key === 'checkin') {
            handleCheckin(record);
          } else if (key === 'cancel-checkin') {
            handleOpenCancelCheckinModal(record);
          } else if (key === 'cancel-ticket') {
            Modal.confirm({
              title: "⚠️ Xác nhận HỦY TOÀN BỘ VÉ này?",
              content: `Vé #${record.ticketCode || record._id.substring(record._id.length - 8).toUpperCase()} sẽ bị hủy và giải phóng ghế cho người khác.`,
              okText: "Đồng ý Hủy Vé",
              okType: "danger",
              cancelText: "Quay lại",
              onOk: () => cancelBooking(record._id),
            });
          }
        };

        return (
          <Space size={6}>
            <Button
              type="primary"
              size="small"
              onClick={() => handleOpenDetail(record)}
            >
              Chi tiết
            </Button>
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
              <Button size="small">
                Thao tác ▾
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const filtered = bookings.filter(
    (item) =>
      item._id.toLowerCase().includes(search.toLowerCase()) ||
      (item.ticketCode || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.showtime?.movie?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card title="🎫 Quản lý vé, Soát vé QR & In vé Rạp">
      {/* Scanner & Search Box */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
          <Input.Search
            placeholder="📷 Quét camera hoặc Nhập Mã vé / Mã QR..."
            enterButton="🔍 Tra cứu"
            size="middle"
            value={qrCodeInput}
            onChange={(e) => setQrCodeInput(e.target.value)}
            onSearch={handleScanOrSearchQR}
          />
        </div>
        <Button
          type="primary"
          size="middle"
          style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2", flexShrink: 0 }}
          onClick={() => setIsCameraOpen(true)}
        >
          📷 Quét Camera
        </Button>
        <Input
          placeholder="Lọc nhanh danh sách..."
          size="middle"
          style={{ width: 200, flexShrink: 0 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        rowKey="_id"
        tableLayout="fixed"
        columns={columns}
        dataSource={filtered}
        loading={loading}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1000 }}
      />

      {/* Live Camera Scanner Modal */}
      <Modal
        open={isCameraOpen}
        centered={true}
        footer={null}
        title="📷 QUÉT MÃ QR BẰNG CAMERA TRỰC TIẾP"
        width={450}
        onCancel={() => setIsCameraOpen(false)}
      >
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: 16 }}>
            Hướng camera máy tính/điện thoại vào <strong>Mã QR vé của Khách hàng</strong> để tự động tra cứu.
          </p>
          <div
            id="camera-reader"
            style={{
              width: "100%",
              maxWidth: 380,
              margin: "0 auto",
              borderRadius: 12,
              overflow: "hidden",
              border: "2px dashed #13c2c2"
            }}
          />
        </div>
      </Modal>

      {/* Ticket Inspection & Print Modal - Tách từng cuống vé lẻ */}
      <Modal
        open={!!detail}
        centered={true}
        footer={null}
        title="🎫 CHI TIẾT ĐƠN VÉ & DANH SÁCH CUỐNG VÉ LẺ"
        width={720}
        onCancel={() => setDetail(null)}
      >
        {detail && (() => {
          const isUnpaidVnpay = (detail.paymentMethod === 'vnpay' || !detail.paymentMethod) && detail.paymentStatus !== 'paid' && detail.status === 'pending';
          const ticketStubs = getBookingTicketStubs(detail);

          return (
            <div>
              {/* Alert status */}
              {isUnpaidVnpay ? (
                <Alert
                  message="🚫 CHƯA THANH TOÁN VNPAY ONLINE"
                  description="Khách hàng chọn thanh toán VNPay nhưng chưa hoàn tất thanh toán. Đơn hàng đang giữ 5 phút. KHÔNG THỂ In vé hoặc Check-in!"
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              ) : detail.isPrinted ? (
                <Alert
                  message="⚠️ VÉ NÀY ĐÃ ĐƯỢC IN TRƯỚC ĐÓ"
                  description={`Thời gian in lần đầu: ${new Date(detail.printedAt!).toLocaleString("vi-VN")}. Hệ thống không cho phép in lại để bảo mật.`}
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <Alert
                  message="✅ VÉ HỢP LỆ - CHƯA IN"
                  description="Khách hàng có thể thực hiện in vé lẻ từng ghế/bỏng nước hoặc in tất cả lần đầu."
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
                {/* QR Code Container */}
                <div style={{
                  width: 174,
                  height: 174,
                  minWidth: 174,
                  minHeight: 174,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 14,
                  padding: 10,
                  background: isUnpaidVnpay ? "#fff2f0" : "#fff",
                  border: isUnpaidVnpay ? "2px dashed #ff4d4f" : "2px solid #1890ff"
                }}>
                  {isUnpaidVnpay ? (
                    <>
                      <div style={{ fontSize: "2.5rem" }}>⏳</div>
                      <span style={{ color: "#ff4d4f", fontWeight: "bold", fontSize: "0.85rem", marginTop: 4, textAlign: "center" }}>CHƯA THANH TOÁN</span>
                    </>
                  ) : (
                    <QRCode value={detail.ticketCode || detail._id} size={150} color="#000" bgColor="#fff" />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 8px 0", color: "#e50914", fontSize: "1.2rem" }}>
                    MÃ VÉ: #{detail.ticketCode || detail._id.toUpperCase()}
                  </h3>
                  <p style={{ margin: "0 0 4px 0" }}>Khách: <strong>{detail.user?.name || "Khách vãng lai"}</strong> ({detail.user?.email || "N/A"})</p>
                  <p style={{ margin: "0 0 4px 0" }}>SĐT: <strong>{detail.user?.phone || "Chưa cập nhật"}</strong></p>
                  <p style={{ margin: 0 }}>Ngày tạo: {new Date(detail.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>

              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Tên phim">
                  <strong style={{ color: "#1890ff", fontSize: "1.05rem" }}>{detail.showtime?.movie?.title || "N/A"}</strong>
                </Descriptions.Item>

                <Descriptions.Item label="Phòng chiếu & Suất chiếu">
                  <strong>{detail.showtime?.room?.name || "N/A"}</strong> - {detail.showtime?.startTime ? new Date(detail.showtime.startTime).toLocaleString("vi-VN") : "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Tổng tiền đơn hàng">
                  <strong style={{ color: "#52c41a", fontSize: "1.2rem" }}>{detail.totalPrice?.toLocaleString("vi-VN")} đ</strong>
                </Descriptions.Item>

                <Descriptions.Item label="Phương thức thanh toán">
                  <Tag color={detail.paymentMethod === 'cash' ? 'cyan' : 'blue'}>
                    {detail.paymentMethod === 'cash' ? '💵 Thanh toán tại quầy' : '💳 Thanh toán VNPay Online'}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái Check-in">
                  {detail.isCheckedIn ? (
                    <Tag color="cyan">✓ Đã Check-in vào rạp</Tag>
                  ) : detail.checkInCancelReason ? (
                    <Alert
                      type="warning"
                      showIcon
                      message={`⚠️ Vé này đã bị Hủy Check-in`}
                      description={`Lý do: "${detail.checkInCancelReason}" ${detail.checkInCancelledAt ? `(Thời gian: ${new Date(detail.checkInCancelledAt).toLocaleString('vi-VN')})` : ''}`}
                      style={{ marginTop: 4 }}
                    />
                  ) : (
                    <Tag color="blue">Chưa Check-in</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>

              {/* TÁCH CHI TIẾT TỪNG CUỐNG VÉ & PHIẾU ĐỒ ĂN LẺ (MỖI DÒNG 1 NÚT IN) */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, color: '#1890ff', fontSize: '1rem', fontWeight: 'bold' }}>
                    📑 DANH SÁCH CUỐNG VÉ & PHIẾU ĐỒ ĂN LẺ ({ticketStubs.length} VÉ)
                  </h4>
                  <Tag color="purple">Tách riêng từng cuống vé</Tag>
                </div>

                <Table
                  size="small"
                  pagination={false}
                  dataSource={ticketStubs}
                  rowKey="id"
                  bordered
                  columns={[
                    {
                      title: "Loại Cuống Vé / Hóa Đơn Lẻ",
                      key: "title",
                      render: (_, stub) => (
                        <div>
                          <div style={{ fontWeight: "bold", color: stub.type === 'combo' ? '#d46b08' : '#e50914' }}>
                            {stub.icon} {stub.title}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#666" }}>
                            Mã vé lẻ: <code>#{stub.ticketCode}-{stub.subCode}</code>
                          </div>
                        </div>
                      )
                    },
                    {
                      title: "Chi tiết",
                      key: "info",
                      render: (_, stub) => (
                        <div style={{ fontSize: "0.85rem" }}>
                          {stub.type === 'seat' ? (
                            <span>Phòng: <strong>{stub.roomName}</strong> | Ghế: <strong style={{ color: "#e50914" }}>{stub.seatName}</strong></span>
                          ) : (
                            <Tag color="orange">🍿 Phiếu quầy Bỏng Nước F&B</Tag>
                          )}
                        </div>
                      )
                    },
                    {
                      title: "Giá vé",
                      dataIndex: "price",
                      width: 105,
                      align: "right" as const,
                      render: (val: number) => <strong style={{ color: "#52c41a" }}>{val.toLocaleString('vi-VN')} đ</strong>
                    },
                    {
                      title: "Thao tác In",
                      key: "action",
                      width: 130,
                      align: "center" as const,
                      render: (_, stub) => (
                        <Button
                          type="primary"
                          size="small"
                          icon={<PrinterOutlined />}
                          style={{
                            backgroundColor: stub.type === 'combo' ? '#fa8c16' : '#1890ff',
                            borderColor: stub.type === 'combo' ? '#fa8c16' : '#1890ff'
                          }}
                          disabled={detail.isPrinted || detail.status === "cancelled" || isUnpaidVnpay}
                          onClick={() => handlePrintSingleItem(detail, stub)}
                        >
                          🖨️ In vé này
                        </Button>
                      )
                    }
                  ]}
                />
              </div>

              {/* Nút In TẤT CẢ vé ở cuối modal */}
              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="primary"
                  size="large"
                  loading={printing}
                  disabled={detail.isPrinted || detail.status === "cancelled" || isUnpaidVnpay}
                  style={{
                    height: 44,
                    minWidth: 280,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    borderRadius: 8,
                    backgroundColor: detail.isPrinted || isUnpaidVnpay ? "#8c8c8c" : "#722ed1",
                    borderColor: detail.isPrinted || isUnpaidVnpay ? "#8c8c8c" : "#722ed1"
                  }}
                  onClick={() => handlePrintTicket(detail)}
                >
                  {isUnpaidVnpay ? "🔒 Khách chưa thanh toán (Khóa in)" : detail.isPrinted ? "⚠️ Vé đã được in (Khóa in)" : `🖨️ In TẤT CẢ ${ticketStubs.length} cuống vé cho khách`}
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal Hủy Check-in Vé có bắt buộc Lý do */}
      <Modal
        open={cancelCheckinModalOpen}
        centered
        title="🚫 XÁC NHẬN HỦY CHECK-IN VÉ HỢP LỆ"
        width={520}
        onCancel={() => setCancelCheckinModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setCancelCheckinModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={submittingCancelCheckin}
            onClick={handleConfirmCancelCheckin}
          >
            Xác nhận Hủy Check-in
          </Button>
        ]}
      >
        {selectedBookingForCancel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Alert
              type="warning"
              showIcon
              message="Yêu cầu nhập/chọn lý do Hủy Check-in"
              description={`Vé #${selectedBookingForCancel.ticketCode || selectedBookingForCancel._id.substring(selectedBookingForCancel._id.length - 8).toUpperCase()} - Khách: ${selectedBookingForCancel.user?.name || "Khách vãng lai"}. Hệ thống sẽ lưu vết lý do hủy vào nhật ký!`}
            />

            <div>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8, color: "#333" }}>
                Chọn hoặc nhập lý do Hủy Check-in (Bắt buộc):
              </label>
              <Radio.Group
                value={cancelReasonPreset}
                onChange={e => setCancelReasonPreset(e.target.value)}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <Radio value="Khách nhầm suất chiếu / nhầm rạp">Khách nhầm suất chiếu / nhầm rạp</Radio>
                <Radio value="Nhân viên quét nhầm mã vé">Nhân viên quét nhầm mã vé</Radio>
                <Radio value="Khách xin hoàn/đổi vé trước giờ chiếu">Khách xin hoàn/đổi vé trước giờ chiếu</Radio>
                <Radio value="custom">Lý do khác (Nhập chi tiết)</Radio>
              </Radio.Group>
            </div>

            {cancelReasonPreset === "custom" && (
              <Input.TextArea
                rows={3}
                placeholder="Nhập chi tiết lý do hủy check-in tại đây..."
                value={customCancelReason}
                onChange={e => setCustomCancelReason(e.target.value)}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Printable Thermal Receipt Stubs rendered directly via Portal to document.body */}
      {detail && createPortal(
        <div id="printable-ticket-section">
          {(() => {
            const allStubs = getBookingTicketStubs(detail);
            const stubsToPrint = printTargetItem ? [printTargetItem] : allStubs;

            return stubsToPrint.map((stub, idx) => (
              <div key={stub.id || idx} className="thermal-ticket-stub">
                <div className="stub-header">
                  <h2>🎬 TNA CINEMA 🎬</h2>
                  <p style={{ fontWeight: 'bold', margin: '4px 0' }}>
                    {stub.type === 'seat' ? (stub.isCouple ? 'Vé GHẾ ĐÔI (COUPLE)' : 'VÉ XEM PHIM CHI TIẾT') : 'PHIẾU ĐỒ ĂN NƯỚC UỐNG'}
                  </p>
                  <div className="divider-line" />
                </div>

                <div className="stub-body">
                  <p className="stub-code"><strong>MÃ CUỐNG VÉ:</strong> #{stub.ticketCode}-{stub.subCode}</p>
                  
                  {stub.type === 'seat' ? (
                    <>
                      <p><strong>Phim:</strong> {stub.movieTitle}</p>
                      <p><strong>Phòng chiếu:</strong> {stub.roomName}</p>
                      <p><strong>Suất chiếu:</strong> {stub.startTime ? new Date(stub.startTime).toLocaleString('vi-VN') : 'N/A'}</p>
                      <p className="highlight-seat"><strong>VỊ TRÍ GHẾ:</strong> {stub.isCouple ? `💕 GHẾ ĐÔI ${stub.seatName}` : stub.seatName}</p>
                      <p><strong>Giá vé:</strong> {stub.price.toLocaleString('vi-VN')} VNĐ</p>
                    </>
                  ) : (
                    <>
                      <p className="highlight-combo"><strong>SẢN PHẨM:</strong> {stub.comboName}</p>
                      <p><strong>Giá tiền:</strong> {stub.price.toLocaleString('vi-VN')} VNĐ</p>
                      <p style={{ fontSize: '11px', color: '#555' }}>* Trình phiếu này tại quầy F&B để nhận đồ ăn *</p>
                    </>
                  )}

                  <div className="divider-line" />
                  <p><strong>Khách hàng:</strong> {stub.customerName}</p>
                  <p><strong>SĐT:</strong> {stub.customerPhone}</p>
                  <p><strong>Thời gian in:</strong> {new Date().toLocaleString('vi-VN')}</p>
                  
                  <div className="stub-qr">
                    <QRCode value={`${stub.ticketCode}-${stub.subCode}`} size={120} />
                  </div>
                </div>

                <div className="stub-footer">
                  <p>Cảm ơn & chúc quý khách xem phim vui vẻ!</p>
                  <p>www.tnacinema.vn - Hotline: 1900 xxxx</p>
                </div>
              </div>
            ));
          })()}
        </div>,
        document.body
      )}

      <style>{`
        @media screen {
          #printable-ticket-section {
            display: none !important;
          }
        }
        @media print {
          @page {
            margin: 0;
            size: auto;
          }

          body > *:not(#printable-ticket-section) {
            display: none !important;
          }

          #printable-ticket-section {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          .thermal-ticket-stub {
            width: 80mm;
            margin: 0 auto;
            padding: 15px 12px;
            border: 1px dashed #000;
            font-family: 'Courier New', Courier, monospace;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            text-align: center;
            background: #fff !important;
            color: #000 !important;
            box-sizing: border-box;
          }

          .thermal-ticket-stub:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>
    </Card>
  );
}