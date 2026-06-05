const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const showtimeRoutes = require('./routes/showtimes');
const bookingRoutes = require('./routes/bookings');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DuAnCuoiCung Backend API' });
});

module.exports = app;
