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

// Routes
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

// ==========================================
// NOTIFICATIONS ROUTES (Directly here)
// ==========================================

// 1. Get Notifications for a specific User
app.get('/api/notifications/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    const data = await sheetsService.getSheetData('Notifications');
    const userNotifs = data.filter(n => n.user_mobile === mobile || n.user_mobile === 'All');
    res.json({ success: true, data: userNotifs.reverse().slice(0, 20) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Admin Post Announcement
app.post('/api/notifications/announce', async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
    const id = `NOTIF-${Date.now()}`;
    const date = new Date().toISOString();
    await sheetsService.appendRow('Notifications', [id, 'All', title, message, date]);
    res.status(201).json({ success: true, message: 'Announcement sent to all users!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 handler
app.use((req, res) => { res.status(404).json({ error: 'Route not found' }); });

// Error handler
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ success: false, error: err.message || 'Something went wrong!' }); });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
