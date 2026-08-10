require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sheetsService = require('./services/sheetsService'); // Imported for settings

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

// ==========================================
// ROUTES
// ==========================================

app.use('/auth', require('./routes/auth'));
app.use('/api/courts', require('./routes/courts'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

// Settings Route (Directly written here to avoid missing file error on Render)
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await sheetsService.getSettings();
    const publicSettings = {
      bankTitle: settings.bank_title || '',
      bankAccount: settings.bank_account || '',
      jazzcashTitle: settings.jazzcash_title || '',
      jazzcashAccount: settings.jazzcash_account || '',
      easypaisaTitle: settings.easypaisa_title || '',
      easypaisaAccount: settings.easypaisa_account || ''
    };
    res.json({ success: true, data: publicSettings });
  } catch (err) {
    console.error('Settings error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Something went wrong!' });
});

// Start Server (0.0.0.0 added for Render port binding)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
});
