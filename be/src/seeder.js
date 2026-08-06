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

        // 4. Seed 12 Movies
        const moviesList = [
            {
                title: 'Lật Mặt 7: Một Điều Ước',
                description: 'Bộ phim tâm lý gia đình đầy cảm xúc của đạo diễn Lý Hải, xoay quanh hành trình tình mẫu tử thiêng liêng và ước mơ giản dị của người mẹ hiền hậu tại vùng quê yên bình.',
                duration: 120,
                poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
                genre: 'Tình Cảm / Gia Đình',
                releaseDate: new Date('2024-04-30')
            },
            {
                title: 'Dune: Hành Tinh Cát 2',
                description: 'Hành trình trả thù và bảo vệ vũ trụ của Paul Atreides khi anh hợp lực cùng Chani và người Fremen trên hành tinh cát Arrakis khắc nghiệt.',
                duration: 166,
                poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
                genre: 'Khoa Học Viễn Tưởng / Hành Động',
                releaseDate: new Date('2024-03-01')
            },
            {
                title: 'Kung Fu Panda 4',
                description: 'Chú gấu Po phải tìm kiếm và huấn luyện một chiến binh Rồng mới trong khi đối đầu với mụ phù thủy biến hình Chameleonic đầy mưu mẹo.',
                duration: 94,
                poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
                genre: 'Hoạt Hình / Hài Hước',
                releaseDate: new Date('2024-03-08')
            },
            {
                title: 'Godzilla x Kong: Đế Chế Mới',
                description: 'Hai siêu quái vật huyền thoại Godzilla và Kong hợp lực chống lại một hiểm họa cổ đại tiềm ẩn sâu bên trong Trái Đất.',
                duration: 115,
                poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
                genre: 'Hành Động / Viễn Tưởng',
                releaseDate: new Date('2024-03-29')
            },
            {
                title: 'Deadpool & Wolverine',
                description: 'Bom tấn siêu hành động hài hước của Marvel khi Deadpool hợp lực cùng Wolverine trong hành trình giải cứu đa vũ trụ khỏi nguy cơ diệt vong.',
                duration: 127,
                poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
                genre: 'Hành Động / Hài Hước',
                releaseDate: new Date('2024-07-26')
            },
            {
                title: 'Inside Out 2: Những Mảnh Ghép Cảm Xúc 2',
                description: 'Bộ phim hoạt hình rực rỡ sắc màu theo chân cô bé Riley khi bước vào tuổi dậy thì với sự xuất hiện của cảm xúc mới đầy xáo trộn: Lo Âu (Anxiety).',
                duration: 96,
                poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80',
                genre: 'Hoạt Hình / Gia Đình',
                releaseDate: new Date('2024-06-14')
            },
            {
                title: 'Kẻ Trộm Mặt Trăng 4 (Despicable Me 4)',
                description: 'Cuộc phiêu lưu tràn ngập tiếng cười của Gru và đại gia đình Minions tinh nghịch khi đối đầu với kẻ thù mới nguy hiểm Maxime Le Mal.',
                duration: 95,
                poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&q=80',
                genre: 'Hoạt Hình / Hài Hước',
                releaseDate: new Date('2024-07-03')
            },
            {
                title: 'Chị Chị Em Em 2',
                description: 'Bộ phim giật gân, đấu trí nảy lửa và đầy quyến rũ xoay quanh cuộc sống vinh hoa cùng những góc khuất bí ẩn của hai mỹ nhân sài thành.',
                duration: 115,
                poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80',
                genre: 'Tâm Lý / Giật Gân',
                releaseDate: new Date('2024-01-22')
            },
            {
                title: 'Venom: Kèo Cuối (The Last Dance)',
                description: 'Trận chiến sinh tử cuối cùng của Eddie Brock và Venom trước cuộc truy quét gắt gao của cả loài người lẫn chủng loài ngoài hành tinh.',
                duration: 110,
                poster: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&q=80',
                genre: 'Hành Động / Viễn Tưởng',
                releaseDate: new Date('2024-10-25')
            },
            {
                title: 'Cám: Chuyện Chưa Kể (Con Cám)',
                description: 'Góc nhìn kinh dị chưa từng được hé lộ về truyện cổ tích Tấm Cám với những bí ẩn rùng rợn và nghi thức bí ẩn tại làng quê cổ xưa.',
                duration: 122,
                poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
                genre: 'Kinh Dị / Bổn Mạng',
                releaseDate: new Date('2024-09-20')
            },
            {
                title: 'Ma Da: Truyền Thuyết Sông Nước',
                description: 'Bộ phim kinh dị lấy cảm hứng từ truyền thuyết dân gian miền sông nước Nam Bộ đầy bí ẩn, kịch tính và lạnh gáy.',
                duration: 98,
                poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
                genre: 'Kinh Dị / Tâm Lý',
                releaseDate: new Date('2024-08-16')
            },
            {
                title: 'Biệt Đội Marvels (The Marvels)',
                description: 'Nữ đại úy Captain Marvel hợp lực cùng Kamala Khan và Monica Rambeau trong trận chiến bảo vệ sự ổn định của đa vũ trụ.',
                duration: 105,
                poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
                genre: 'Hành Động / Viễn Tưởng',
                releaseDate: new Date('2023-11-10')
            }
        ];

        const savedMovies = [];
        for (const item of moviesList) {
            const m = new Movie(item);
            const savedM = await m.save();
            savedMovies.push(savedM);
        }
        console.log(`Đã khởi tạo thành công ${savedMovies.length} Bộ phim!`);

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
            type: '2D Standard',
            totalSeats: 80,
            seatLayout: generateSeatLayout()
        });

        const room2 = new Room({
            name: 'Phòng chiếu 02 (IMAX 3D)',
            type: 'IMAX 3D',
            totalSeats: 80,
            seatLayout: generateSeatLayout()
        });

        const room3 = new Room({
            name: 'Phòng chiếu VIP 03',
            type: 'Phòng VIP',
            totalSeats: 80,
            seatLayout: generateSeatLayout()
        });

        const savedRoom1 = await room1.save();
        const savedRoom2 = await room2.save();
        const savedRoom3 = await room3.save();
        const rooms = [savedRoom1, savedRoom2, savedRoom3];
        console.log('Đã khởi tạo danh sách Phòng chiếu!');

        // 6. Seed Showtimes for all movies (Today and Future Days)
        const createDate = (daysFromNow, hours, minutes) => {
            const d = new Date();
            d.setDate(d.getDate() + daysFromNow);
            d.setHours(hours, minutes, 0, 0);
            return d;
        };

        const showtimesToSave = [];
        // Create active showtimes for today, tomorrow and next 3 days
        const startHours = [10, 13, 16, 19, 21];

        savedMovies.forEach((movie, mIdx) => {
            const room = rooms[mIdx % rooms.length];
            const hour = startHours[mIdx % startHours.length];
            
            // Showtime Today
            showtimesToSave.push(new Showtime({
                movie: movie._id,
                room: room._id,
                startTime: createDate(0, hour, 30),
                endTime: createDate(0, hour + 2, 30),
                ticketPrice: 85000 + (mIdx % 3) * 10000
            }));

            // Showtime Tomorrow
            showtimesToSave.push(new Showtime({
                movie: movie._id,
                room: rooms[(mIdx + 1) % rooms.length]._id,
                startTime: createDate(1, (hour + 2) % 23, 0),
                endTime: createDate(1, ((hour + 4) % 23), 0),
                ticketPrice: 90000 + (mIdx % 2) * 10000
            }));

            // Showtime Day After Tomorrow
            showtimesToSave.push(new Showtime({
                movie: movie._id,
                room: rooms[(mIdx + 2) % rooms.length]._id,
                startTime: createDate(2, hour, 15),
                endTime: createDate(2, hour + 2, 15),
                ticketPrice: 95000
            }));
        });

        let createdShowtimes = [];
        for (const st of showtimesToSave) {
            const savedSt = await st.save();
            createdShowtimes.push(savedSt);
        }
        console.log(`Đã khởi tạo ${createdShowtimes.length} Suất chiếu cho tất cả các phim!`);

        // 7. Seed Bookings
        const booking1 = new Booking({
            user: customer1._id,
            showtime: createdShowtimes[0]._id,
            seats: ['C5', 'C6'],
            totalPrice: 170000,
            status: 'confirmed',
            paymentStatus: 'paid'
        });

        const booking2 = new Booking({
            user: customer2._id,
            showtime: createdShowtimes[1]._id,
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
