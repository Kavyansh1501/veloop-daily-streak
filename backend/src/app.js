const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const dailyStreakRoutes = require('./routes/dailyStreakRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'VELoop Daily Streak API is running.' })
);

app.use('/api/auth', authRoutes);
app.use('/api/daily-streak', dailyStreakRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use(errorHandler);

module.exports = app;
