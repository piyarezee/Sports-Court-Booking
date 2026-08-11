require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sheetsService = require('./services/sheetsService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sports Court Booking API is running', version: '1.1.1', timestamp: new Date().toISOString() });
});

app.use('/auth', require('./routes/auth'));
app.use('/api/courts', require('./routes/courts'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

// Settings Route (Directly here to avoid missing file error)
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

app.use((req, res) => { res.status(404).json({ error: 'Route not found' }); });
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ success: false, error: err.message || 'Something went wrong!' }); });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
