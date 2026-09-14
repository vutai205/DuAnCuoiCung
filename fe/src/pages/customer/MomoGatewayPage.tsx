import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCode, Spin, message } from 'antd';

const MomoGatewayPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const orderId = searchParams.get('orderId') || `MOMO_${Date.now()}`;
    const amount = Number(searchParams.get('amount')) || 0;
    const bookingId = searchParams.get('bookingId') || orderId.split('_')[0];
    const orderInfo = searchParams.get('orderInfo') || `Thanh toan ve xem phim TNA Cinema #${bookingId}`;

    const [paymentTab, setPaymentTab] = useState<'qr' | 'wallet'>('qr');
    const [phone, setPhone] = useState('0987654321');
    const [passcode, setPasscode] = useState('123456');
    const [otp, setOtp] = useState('666888');
    const [isProcessing, setIsProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes countdown

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        message.loading({ content: 'Đang kết nối Ví MoMo & xác thực giao dịch...', key: 'momo_pay' });

        try {
            // Simulate 1.5 seconds delay for realistic gateway experience
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Direct browser navigation to momo_return endpoint (handles DB update + email + redirect to /payment-success)
            window.location.href = `/api/payment/momo_return?orderId=${orderId}&resultCode=0`;
        } catch (err: any) {
            console.error('Lỗi khi xác nhận thanh toán MoMo:', err);
            message.error({ content: 'Có lỗi xảy ra trong quá trình xử lý thanh toán!', key: 'momo_pay' });
            setIsProcessing(false);
        }
    };

    const handleCancelPayment = () => {
        if (window.confirm('Bạn có chắc chắn muốn hủy giao dịch thanh toán MoMo?')) {
            navigate(`/payment-failed?orderId=${orderId}`);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1f0413 0%, #0d0108 50%, #15020d 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '30px 15px',
            fontFamily: "'Segoe UI', Roboto, sans-serif"
        }}>
            <div style={{
                width: '100%',
                maxWidth: '920px',
                background: 'rgba(20, 10, 17, 0.85)',
                backdropFilter: 'blur(16px)',
                borderRadius: '20px',
                border: '1px solid rgba(216, 45, 139, 0.3)',
                boxShadow: '0 20px 50px rgba(165, 0, 100, 0.25)',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))'
            }}>
                {/* Left Side: Order Summary & Info */}
                <div style={{
                    padding: '35px 30px',
                    background: 'linear-gradient(180deg, rgba(165, 0, 100, 0.15) 0%, rgba(20, 10, 17, 0.4) 100%)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        {/* MoMo Header Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#a50064',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontWeight: 900,
                                fontSize: '20px',
                                boxShadow: '0 4px 15px rgba(165, 0, 100, 0.5)'
                            }}>
                                momo
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ff66c4', letterSpacing: '0.5px' }}>
                                    CỔNG THANH TOÁN MOMO
                                </h3>
                                <span style={{ fontSize: '12px', color: '#f472b6', background: 'rgba(216, 45, 139, 0.2)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(216, 45, 139, 0.4)' }}>
                                    SANDBOX DEVELOPER
                                </span>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '18px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
                            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Đơn vị chấp nhận thanh toán:</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🎬 TNA CINEMA SYSTEM
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                                <span style={{ color: '#94a3b8' }}>Mã đơn hàng:</span>
                                <strong style={{ color: '#f1f5f9' }}>#{orderId.substring(0, 18)}...</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                                <span style={{ color: '#94a3b8' }}>Nội dung:</span>
                                <strong style={{ color: '#cbd5e1' }}>{orderInfo}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                                <span style={{ color: '#94a3b8' }}>Thời hạn còn lại:</span>
                                <strong style={{ color: '#fbbf24', fontSize: '15px' }}>⏱️ {formatTime(timeLeft)}</strong>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', background: 'rgba(216, 45, 139, 0.12)', borderRadius: '14px', padding: '20px', border: '1px solid rgba(216, 45, 139, 0.3)' }}>
                        <div style={{ fontSize: '13px', color: '#f472b6', marginBottom: '6px' }}>TỔNG TIỀN THANH TOÁN:</div>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#ff66c4', letterSpacing: '-0.5px' }}>
                            {amount.toLocaleString('vi-VN')} đ
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Form / QR Code */}
                <div style={{ padding: '35px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        {/* Tabs switch */}
                        <div style={{
                            display: 'flex',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: '12px',
                            padding: '4px',
                            marginBottom: '25px'
                        }}>
                            <button
                                type="button"
                                onClick={() => setPaymentTab('qr')}
                                style={{
                                    flex: 1,
                                    padding: '10px 0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: paymentTab === 'qr' ? '#a50064' : 'transparent',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                📱 Quét mã QR MoMo
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentTab('wallet')}
                                style={{
                                    flex: 1,
                                    padding: '10px 0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: paymentTab === 'wallet' ? '#a50064' : 'transparent',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                💳 Số Ví MoMo / Thẻ
                            </button>
                        </div>

                        {paymentTab === 'qr' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{
                                    padding: '15px',
                                    background: '#fff',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    marginBottom: '15px',
                                    position: 'relative'
                                }}>
                                    <QRCode value={`2|99|0987654321|TNA CINEMA|${amount}|0|0|${orderId}`} size={200} color="#a50064" bgColor="#ffffff" />
                                    {isProcessing && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(255,255,255,0.92)',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <Spin size="large" />
                                            <span style={{ color: '#a50064', fontWeight: 700, fontSize: '13px' }}>Đang xác thực...</span>
                                        </div>
                                    )}
                                </div>
                                <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0, maxWidth: '280px' }}>
                                    Mở app <strong>MoMo</strong> chọn <strong>"Quét Mã"</strong> hoặc bấm nút xác nhận bên dưới để thanh toán thử nghiệm.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Số điện thoại Ví MoMo Test:</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(216, 45, 139, 0.4)',
                                            background: 'rgba(0,0,0,0.4)',
                                            color: '#fff',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Mật khẩu Ví MoMo:</label>
                                    <input
                                        type="password"
                                        value={passcode}
                                        onChange={e => setPasscode(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(216, 45, 139, 0.4)',
                                            background: 'rgba(0,0,0,0.4)',
                                            color: '#fff',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Mã xác thực OTP thử nghiệm:</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(216, 45, 139, 0.4)',
                                            background: 'rgba(0,0,0,0.4)',
                                            color: '#fff',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ fontSize: '12px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                    💡 <strong>Tài khoản Sandbox mẫu:</strong><br />
                                    • SĐT: 0987654321 | Mật khẩu: 123456
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            type="button"
                            disabled={isProcessing || timeLeft <= 0}
                            onClick={handleConfirmPayment}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #a50064 0%, #d82d8b 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '15px',
                                cursor: 'pointer',
                                boxShadow: '0 6px 20px rgba(165, 0, 100, 0.4)',
                                opacity: isProcessing || timeLeft <= 0 ? 0.7 : 1,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isProcessing ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Spin size="small" /> ĐANG XỬ LÝ THANH TOÁN...
                                </span>
                            ) : (
                                `XÁC NHẬN THANH TOÁN (${amount.toLocaleString('vi-VN')} đ)`
                            )}
                        </button>

                        <button
                            type="button"
                            disabled={isProcessing}
                            onClick={handleCancelPayment}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '10px',
                                color: '#94a3b8',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                        >
                            Hủy giao dịch & Quay lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MomoGatewayPage;
