require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Room = require('./models/Room');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Booking.deleteMany({});
        await Showtime.deleteMany({});
        await Room.deleteMany({});
        await Movie.deleteMany({});
        await User.deleteMany({});

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

        // 2. Seed Movies
        const movie1 = new Movie({
            title: 'Lật Mặt 7: Một Điều Ước',
            description: 'Phim tình cảm gia đình ý nghĩa xoay quanh câu chuyện của người mẹ hiền hậu.',
            duration: 120,
            poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
            genre: 'Drama/Comedy',
            releaseDate: new Date('2024-04-30')
        });

        const movie2 = new Movie({
            title: 'Dune: Hành Tinh Cát 2',
            description: 'Phim bom tấn khoa học viễn tưởng hoành tráng nhất năm.',
            duration: 166,
            poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
            genre: 'Sci-Fi/Action',
            releaseDate: new Date('2024-03-01')
        });

        await movie1.save();
        await movie2.save();
        console.log('Đã khởi tạo danh sách Phim!');

        // 3. Seed Rooms
        const seatLayout = [];
        const rows = ['A', 'B', 'C', 'D', 'E'];
        for (let row of rows) {
            for (let i = 1; i <= 10; i++) {
                seatLayout.push({
                    seatName: `${row}${i}`,
                    type: row === 'C' || row === 'D' ? 'vip' : 'regular'
                });
            }
        }

        const room1 = new Room({
            name: 'Phòng chiếu 1 (IMAX)',
            totalSeats: 50,
            seatLayout: seatLayout
        });

        const room2 = new Room({
            name: 'Phòng chiếu 2 (Standard)',
            totalSeats: 50,
            seatLayout: seatLayout
        });

        await room1.save();
        await room2.save();
        console.log('Đã khởi tạo danh sách Phòng chiếu!');

        // 4. Seed Showtimes
        const now = new Date();
        const showtime1 = new Showtime({
            movie: movie1._id,
            room: room1._id,
            startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
            endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
            ticketPrice: 90000
        });

        const showtime2 = new Showtime({
            movie: movie2._id,
            room: room1._id,
            startTime: new Date(now.getTime() + 5 * 60 * 60 * 1000), // 5 hours later
            endTime: new Date(now.getTime() + 8 * 60 * 60 * 1000),
            ticketPrice: 120000
        });

        await showtime1.save();
        await showtime2.save();
        console.log('Đã khởi tạo lịch chiếu!');

        // 5. Seed Bookings
        const booking1 = new Booking({
            user: customer1._id,
            showtime: showtime1._id,
            seats: ['A1', 'A2'],
            totalPrice: 180000,
            status: 'confirmed',
            paymentStatus: 'paid'
        });

        const booking2 = new Booking({
            user: customer2._id,
            showtime: showtime2._id,
            seats: ['B3', 'B4', 'B5'],
            totalPrice: 360000,
            status: 'confirmed',
            paymentStatus: 'paid'
        });

        const booking3 = new Booking({
            user: customer1._id,
            showtime: showtime1._id,
            seats: ['C5'],
            totalPrice: 90000,
            status: 'pending',
            paymentStatus: 'unpaid'
        });

        const booking4 = new Booking({
            user: customer2._id,
            showtime: showtime2._id,
            seats: ['D1'],
            totalPrice: 120000,
            status: 'cancelled',
            paymentStatus: 'failed'
        });

        await booking1.save();
        await booking2.save();
        await booking3.save();
        await booking4.save();
        console.log('Đã khởi tạo danh sách đặt vé mẫu!');

        console.log('Gieo dữ liệu thành công!');
        process.exit(0);
    } catch (error) {
        console.error(`Lỗi gieo dữ liệu: ${error.message}`);
        process.exit(1);
    }
};

seedData();
