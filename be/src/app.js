const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const movieRoutes = require('./routes/movies');
const roomRoutes = require('./routes/rooms');
const showtimeRoutes = require('./routes/showtimes');
const bookingRoutes = require('./routes/bookings');
const uploadRoutes = require('./routes/uploadRoutes');
const bannerRoutes = require('./routes/banners');
const path = require('path');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/banners', bannerRoutes);

// Phục vụ các file tĩnh trong thư mục uploads
const _dirname = path.resolve();
app.use('/uploads', express.static(path.join(_dirname, 'uploads')));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DuAnCuoiCung Backend API' });
});

module.exports = app;
