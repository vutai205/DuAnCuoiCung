# Backend - Đặt Vé Rạp Chiếu Phim

Đây là mã nguồn Backend (Node.js/Express) cho dự án Đặt vé rạp chiếu phim.

## Hướng dẫn cài đặt cho các thành viên trong nhóm

Vì lý do bảo mật, file `.env` chứa các chuỗi kết nối Database và Khóa bí mật đã bị loại bỏ khỏi Github. Khi tải (clone) dự án này về máy, các bạn cần tự thiết lập môi trường theo các bước sau:

### Bước 1: Cài đặt thư viện
Mở Terminal ở thư mục `be` và chạy lệnh:
```bash
npm install
```

### Bước 2: Thiết lập file môi trường (.env)
1. Trong thư mục `be`, tìm file `.env.example`.
2. Copy toàn bộ nội dung của `.env.example` và dán vào một file mới tạo tên là `.env` (cũng nằm trong thư mục `be`).
3. Nếu bạn dùng MongoDB cài trên máy tính (Local), hãy giữ nguyên `MONGODB_URI=mongodb://localhost:27017/duancuoicung`.
   *(Lưu ý: Bạn bắt buộc phải bật MongoDB Server trên máy tính thì web mới kết nối được).*

*(Khuyến nghị cho nhóm: Các bạn có thể đăng ký tài khoản **MongoDB Atlas** (Cloud Database). Sau đó lấy Link kết nối thay vào `MONGODB_URI`. Như vậy cả nhóm sẽ dùng chung 1 database online, không cần cài MongoDB ở máy cá nhân nữa).*

### Bước 3: Khởi tạo dữ liệu Admin (Seeder)
Do Database mới hoàn toàn trống, các bạn cần chạy lệnh sau để tự động tạo tài khoản Admin mặc định:
```bash
npm run seed
```
- **Tài khoản Admin mặc định:**
  - Email: `admin@gmail.com`
  - Mật khẩu: `password123`

### Bước 4: Khởi động Server
```bash
npm run dev
```
Server sẽ chạy ở địa chỉ `http://localhost:5000`.

## Các lệnh có sẵn:
- `npm run start`: Chạy server (môi trường Production).
- `npm run dev`: Chạy server với nodemon (môi trường Development, tự khởi động lại khi có thay đổi code).
- `npm run seed`: Chạy script để tạo tài khoản Admin mặc định.
