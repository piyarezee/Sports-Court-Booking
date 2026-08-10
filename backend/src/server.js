require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sports Court Booking API is running',
    version: '1.1.1',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/courts', require('./routes/courts'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact')); // <-- Naya Contact Route Add Kiya
app.use('/api/settings', require('./routes/settings')); // <-- Naya Payment Route Add Kiya

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Google Auth: http://localhost:${PORT}/auth/google`);
  console.log(`📊 Auth Status: http://localhost:${PORT}/auth/status`);
  console.log(`👤 Admin Login: POST http://localhost:${PORT}/api/admin/login`);
});
