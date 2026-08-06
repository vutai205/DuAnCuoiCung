require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Room = require('./models/Room');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');
const Banner = require('./models/Banner');
const Food = require('./models/Food');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Booking.deleteMany({});
        await Showtime.deleteMany({});
        await Room.deleteMany({});
        await Movie.deleteMany({});
        await User.deleteMany({});
        await Banner.deleteMany({});
        await Food.deleteMany({});

        console.log('Đã xóa sạch dữ liệu cũ!');

        // 1. Seed Users
        const admin = new User({
            name: 'Quản trị viên',
            email: 'admin@gmail.com',
            password: 'password123',
            role: 'admin',
            status: true
        });

        const customer1 = new User({
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@gmail.com',
            password: 'password123',
            role: 'user',
            status: true
        });

        const customer2 = new User({
            name: 'Trần Thị B',
            email: 'tranthib@gmail.com',
            password: 'password123',
            role: 'user',
            status: true
        });

        await admin.save();
        await customer1.save();
        await customer2.save();
        console.log('Đã khởi tạo danh sách User!');

        // 2. Seed Banners
        const banner1 = new Banner({
            title: 'Bom Tấn Mùa Hè 2026 - Lật Mặt 7',
            imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80',
            linkUrl: '/movie',
            isActive: true
        });

        const banner2 = new Banner({
            title: 'Trải Nghiệm Phòng Chiếu Đẳng Cấp IMAX 3D',
            imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
            linkUrl: '/showtimes',
            isActive: true
        });

        const banner3 = new Banner({
            title: 'Ưu Đãi Đặt Vé Online - Tặng Combo Bỏng Nước',
            imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=1200&q=80',
            linkUrl: '/promotions',
            isActive: true
        });

        await banner1.save();
        await banner2.save();
        await banner3.save();
        console.log('Đã khởi tạo Banners!');

        // 3. Seed Foods
        const food1 = new Food({
            name: 'Combo Solo (1 Bỏng + 1 Nước)',
            image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300&q=80',
            price: 65000,
            quantity: 100,
            category: 'Bỏng nước'
        });

        const food2 = new Food({
            name: 'Combo Đôi (1 Bỏng + 2 Nước)',
            image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300&q=80',
            price: 95000,
            quantity: 100,
            category: 'Combo Tiết Kiệm'
        });

        const food3 = new Food({
            name: 'Combo Gia Đình (2 Bỏng + 2 Nước)',
            image: 'https://images.unsplash.com/photo-1572177191856-3cde618dee1f?w=300&q=80',
            price: 135000,
            quantity: 50,
            category: 'Combo Gia Đình'
        });

        await food1.save();
        await food2.save();
        await food3.save();
        console.log('Đã khởi tạo danh sách Đồ ăn & Nước uống!');

        // 4. Seed Movies
        const movie1 = new Movie({
            title: 'Lật Mặt 7: Một Điều Ước',
            description: 'Bộ phim tâm lý gia đình đầy cảm xúc của đạo diễn Lý Hải, xoay quanh hành trình tình mẫu tử thiêng liêng và ước mơ giản dị của người mẹ hiền hậu tại vùng quê yên bình.',
            duration: 120,
            poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
            genre: 'Tình Cảm / Gia Đình',
            releaseDate: new Date('2024-04-30')
        });

        const movie2 = new Movie({
            title: 'Dune: Hành Tinh Cát 2',
            description: 'Hành trình trả thù và bảo vệ vũ trụ của Paul Atreides khi anh hợp lực cùng Chani và người Fremen trên hành tinh cát Arrakis khắc nghiệt.',
            duration: 166,
            poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
            genre: 'Khoa Học Viễn Tưởng / Hành Động',
            releaseDate: new Date('2024-03-01')
        });

        const movie3 = new Movie({
            title: 'Kung Fu Panda 4',
            description: 'Chú gấu Po phải tìm kiếm và huấn luyện một chiến binh Rồng mới trong khi đối đầu với mụ phù thủy biến hình Chameleonic đầy mưu mẹo.',
            duration: 94,
            poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
            genre: 'Hoạt Hình / Hài Hước',
            releaseDate: new Date('2024-03-08')
        });

        const movie4 = new Movie({
            title: 'Godzilla x Kong: Đế Chế Mới',
            description: 'Hai siêu quái vật huyền thoại Godzilla và Kong hợp lực chống lại một hiểm họa cổ đại tiềm ẩn sâu bên trong Trái Đất.',
            duration: 115,
            poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
            genre: 'Hành Động / Viễn Tưởng',
            releaseDate: new Date('2024-03-29')
        });

        await movie1.save();
        await movie2.save();
        await movie3.save();
        await movie4.save();
        console.log('Đã khởi tạo danh sách Phim!');

        // 5. Seed Rooms
        const generateSeatLayout = () => {
            const layout = [];
            const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
                const rowName = rows[rowIdx];
                let seatType = 'regular';
                if (rowIdx >= 2 && rowIdx <= 5) seatType = 'vip';
                if (rowIdx >= 6) seatType = 'couple';

                for (let num = 1; num <= 10; num++) {
                    layout.push({
                        seatName: `${rowName}${num}`,
                        type: seatType
                    });
                }
            }
            return layout;
        };

        const room1 = new Room({
            name: 'Phòng chiếu 01 (2D Standard)',
            totalSeats: 80,
            seatLayout: generateSeatLayout()
        });

        const room2 = new Room({
            name: 'Phòng chiếu 02 (IMAX 3D)',
            totalSeats: 80,
            seatLayout: generateSeatLayout()
        });

        const room3 = new Room({
            name: 'Phòng chiếu VIP 03',
            totalSeats: 80,
            seatLayout: generateSeatLayout()
        });

        await room1.save();
        await room2.save();
        await room3.save();
        console.log('Đã khởi tạo danh sách Phòng chiếu!');

        // 6. Seed Showtimes
        const createDate = (daysFromNow, hours, minutes) => {
            const d = new Date();
            d.setDate(d.getDate() + daysFromNow);
            d.setHours(hours, minutes, 0, 0);
            return d;
        };

        const showtime1 = new Showtime({
            movie: movie1._id,
            room: room1._id,
            startTime: createDate(0, 14, 30),
            endTime: createDate(0, 16, 30),
            ticketPrice: 85000
        });

        const showtime2 = new Showtime({
            movie: movie1._id,
            room: room2._id,
            startTime: createDate(0, 19, 0),
            endTime: createDate(0, 21, 0),
            ticketPrice: 110000
        });

        const showtime3 = new Showtime({
            movie: movie2._id,
            room: room2._id,
            startTime: createDate(0, 20, 15),
            endTime: createDate(0, 23, 0),
            ticketPrice: 120000
        });

        const showtime4 = new Showtime({
            movie: movie3._id,
            room: room1._id,
            startTime: createDate(1, 15, 0),
            endTime: createDate(1, 16, 35),
            ticketPrice: 80000
        });

        const showtime5 = new Showtime({
            movie: movie4._id,
            room: room3._id,
            startTime: createDate(1, 18, 30),
            endTime: createDate(1, 20, 25),
            ticketPrice: 105000
        });

        await showtime1.save();
        await showtime2.save();
        await showtime3.save();
        await showtime4.save();
        await showtime5.save();
        console.log('Đã khởi tạo Suất chiếu!');

        // 7. Seed Bookings
        const booking1 = new Booking({
            user: customer1._id,
            showtime: showtime1._id,
            seats: ['C5', 'C6'],
            totalPrice: 170000,
            status: 'confirmed',
            paymentStatus: 'paid'
        });

        const booking2 = new Booking({
            user: customer2._id,
            showtime: showtime2._id,
            seats: ['D3', 'D4', 'D5'],
            totalPrice: 330000,
            status: 'confirmed',
            paymentStatus: 'paid'
        });

        await booking1.save();
        await booking2.save();
        console.log('Đã khởi tạo đơn đặt vé mẫu!');

        console.log('Gieo dữ liệu thành công!');
        process.exit(0);
    } catch (error) {
        console.error(`Lỗi gieo dữ liệu: ${error.message}`);
        process.exit(1);
    }
};

seedData();
