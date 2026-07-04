require('dotenv').config();
const Movie = require('./models/Movie');
const connectDB = require('./config/db');
const sampleMovies = [
    { title: 'Hanh Trinh Cua Pi', description: 'Cuoc phieu luu ky dieu cua cau be Pi cung chu ho tren dai duong.', duration: 127, genre: 'Phieu luu', poster: 'https://image.tmdb.org/t/p/w500/iLgT8caLHvgo0jBdrTKjvHa72JV.jpg', releaseDate: new Date('2024-01-10'), ageRating: 'P' },
    { title: 'Vuong Quoc Bang Gia', description: 'Hai chi em cong chua va phep mau mua dong bat tan.', duration: 102, genre: 'Hoat hinh', poster: 'https://image.tmdb.org/t/p/w500/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg', releaseDate: new Date('2024-03-15'), ageRating: 'K' },
    { title: 'Biet Doi Sieu Anh Hung', description: 'Nhung sieu anh hung hop suc bao ve Trai Dat khoi hiem hoa.', duration: 143, genre: 'Hanh dong', poster: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg', releaseDate: new Date('2024-05-20'), ageRating: 'T13' },
    { title: 'Truy Lung Toi Pham', description: 'Cuoc ruot duoi nghet tho giua tham tu va bang dang toi pham.', duration: 118, genre: 'Hinh su', poster: 'https://image.tmdb.org/t/p/w500/9O1Iy9od7uGuULG6FmHcKVGyhJN.jpg', releaseDate: new Date('2024-06-05'), ageRating: 'T16' },
    { title: 'Bong Dem Kinh Hoang', description: 'Mot ngoi nha ma am va nhung bi mat rung ron duoc he lo.', duration: 109, genre: 'Kinh di', poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', releaseDate: new Date('2024-07-12'), ageRating: 'T18' },
    { title: 'Lan Ranh Bao Luc', description: 'Bo phim de cap den nhung de tai nhay cam, khong duoc phep pho bien.', duration: 132, genre: 'Tam ly', poster: 'https://image.tmdb.org/t/p/w500/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', releaseDate: new Date('2024-08-01'), ageRating: 'C' }
];
const seedMovies = async () => {
    try {
        await connectDB();
        for (const data of sampleMovies) {
            const exists = await Movie.findOne({ title: data.title });
            if (exists) { console.log('Phim da ton tai, bo qua: ' + data.title); continue; }
            await Movie.create(data);
            console.log('Da them phim: ' + data.title + ' (' + data.ageRating + ')');
        }
        console.log('Hoan tat them phim mau!');
        process.exit();
    } catch (error) {
        console.error('Loi: ' + error.message);
        process.exit(1);
    }
};
seedMovies();
