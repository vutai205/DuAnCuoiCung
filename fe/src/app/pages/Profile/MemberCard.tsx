import { Link } from "react-router-dom";
import "./MemberCard.css";

export default function MemberCard() {
    const member = {
        cardNumber: "M099361D0",
        fullName: "Đức Việt Anh Lê",
        birthDate: "01/04/2005",
        gender: "Nam",
        address: "Hà Nội",
        status: "Đang hoạt động",
        activeDate: "25/08/2025",
    };

    return (
        <div className="member-page">
            <div className="member-wrapper">

                <div className="member-card">
                    <div className="row" style={{ gridTemplateColumns: "350px 1fr", gap: 40 }}>
                        <div>
                            <div className="cinema-card">
                                <div className="card-logo">
                                    <img src="/logo.png" alt="logo" />
                                </div>

                                <div className="card-qr">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${member.cardNumber}`}
                                        alt="qr"
                                    />
                                </div>

                                <div className="card-footer">
                                    <h3>{member.fullName}</h3>
                                    <p>{member.cardNumber}</p>
                                </div>
                            </div>
                        </div>

                        <div className="member-info">
                            <div className="row">
                                <div className="form-group">
                                    <label>Mã thẻ</label>
                                    <input type="text" value={member.cardNumber} readOnly />
                                </div>

                                <div className="form-group">
                                    <label>Chủ thẻ</label>
                                    <input type="text" value={member.fullName} readOnly />
                                </div>
                            </div>

                            <div className="row">
                                <div className="form-group">
                                    <label>Ngày sinh</label>
                                    <input type="text" value={member.birthDate} readOnly />
                                </div>

                                <div className="form-group">
                                    <label>Giới tính</label>
                                    <input type="text" value={member.gender} readOnly />
                                </div>
                            </div>

                            <div className="row">
                                <div className="form-group">
                                    <label>Địa chỉ</label>
                                    <input type="text" value={member.address} readOnly />
                                </div>

                                <div className="form-group">
                                    <label>Trạng thái thẻ</label>
                                    <input type="text" value={member.status} readOnly className="active-status" />
                                </div>
                            </div>

                            <div className="row">
                                <div className="form-group">
                                    <label>Ngày kích hoạt</label>
                                    <input type="text" value={member.activeDate} readOnly />
                                </div>
                            </div>

                            <div className="member-alert">
                                <h4>Thông tin đăng ký thẻ thành viên U22 của bạn đang chờ phê duyệt.</h4>
                                <p>Vui lòng đến Trung tâm Chiếu phim Quốc gia để hoàn tất thủ tục.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}