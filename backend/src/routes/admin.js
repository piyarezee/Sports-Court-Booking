const express = require('express');
const sheetsService = require('../services/sheetsService');
// const emailService = require('../services/emailService'); // Email disabled

const router = express.Router();

// Custom Staff Auth Middleware
const staffAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.replace('Bearer ', '');
  const decoded = Buffer.from(token, 'base64').toString('utf8');
  const [role, password] = decoded.split(':');
  const staffPassword = process.env.STAFF_PASSWORD || 'staff123';
  if (role === 'staff' && password === staffPassword) next();
  else return res.status(401).json({ error: 'Unauthorized' });
};

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = Buffer.from(`${email}:${password}`).toString('base64');
    return res.json({ success: true, token, admin: { email } });
  }
  return res.status(401).json({ success: false, error: 'Invalid email or password' });
});

// POST /api/admin/staff/login
router.post('/staff/login', (req, res) => {
  const { password } = req.body;
  const staffPassword = process.env.STAFF_PASSWORD || 'staff123';
  if (password === staffPassword) {
    const token = Buffer.from(`staff:${password}`).toString('base64');
    return res.json({ success: true, token, role: 'staff' });
  }
  return res.status(401).json({ success: false, error: 'Invalid staff password' });
});

// GET /api/admin/staff/today-bookings
router.get('/staff/today-bookings', staffAuth, async (req, res) => {
  try {
    const bookings = await sheetsService.getBookings();
    const approvedBookings = bookings.filter(b => b.status === 'approved');
    res.json({ success: true, data: approvedBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ADMIN AUTH MIDDLEWARE
// ==========================================
const adminAuth = require('../middleware/adminAuth');
router.use(adminAuth);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await sheetsService.getDashboardStats();
    const bookings = await sheetsService.getBookings();
    const courts = await sheetsService.getCourts();
    res.json({
      success: true,
      data: {
        totalBookings: stats.totalBookings,
        pending: stats.pendingBookings,
        approved: stats.approvedBookings,
        totalRevenue: stats.totalRevenue,
        totalCourts: courts.length,
        recentBookings: bookings.slice(-10).reverse()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status } = req.query;
    let bookings = await sheetsService.getBookings();
    if (status && status !== 'all') bookings = bookings.filter(b => b.status === status);
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/bookings/:id/status
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected' });
    }

    const updated = await sheetsService.updateBookingStatus(id, status, notes || '');
    res.json({ success: true, message: `Booking ${status}`, data: updated });

    // Email disabled, using WhatsApp instead
    /*
    const allBookings = await sheetsService.getBookings();
    const booking = allBookings.find(b => b.id === id);
    if (booking) {
      try {
        await emailService.sendBookingStatusEmail({ ... });
      } catch (emailErr) {
        console.error('Status email failed:', emailErr.message);
      }
    }
    */
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/customers
router.get('/customers', async (req, res) => {
  try {
    const data = await sheetsService.getSheetData('Customers');
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/courts
router.get('/courts', async (req, res) => {
  try {
    const courts = await sheetsService.getCourts();
    res.json({ success: true, data: courts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/walk-ins
router.post('/walk-ins', async (req, res) => {
  try {
    const { customerName, mobile, courtName, date, time, amount } = req.body;
    if (!customerName || !courtName || !date || !time || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const walkIn = await sheetsService.createWalkIn({ customerName, mobile, courtName, date, time, amount });
    res.status(201).json({ success: true, data: walkIn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/payments
router.get('/payments', async (req, res) => {
  try {
    const data = await sheetsService.getSheetData(sheetsService.SHEETS.PAYMENTS);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/contact
router.get('/contact', async (req, res) => {
  try {
    const data = await sheetsService.getSheetData(sheetsService.SHEETS.CONTACT);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/system-status
router.get('/system-status', async (req, res) => {
  try {
    let sheetsStatus = { status: 'Operational', message: 'Connected' };
    let driveStatus = { status: 'Operational', message: 'Connected' };
    try { await sheetsService.getSheetData(sheetsService.SHEETS.COURTS); } catch (err) { sheetsStatus = { status: 'Error', message: 'Auth failed' }; driveStatus = { status: 'Error', message: 'Auth failed' }; }
    const stats = await sheetsService.getDashboardStats();
    res.json({
      success: true,
      data: {
        backend: { status: 'Operational', message: 'Server is running smoothly' },
        googleSheets: sheetsStatus,
        googleDrive: driveStatus,
        whatsapp: { status: 'Operational', message: 'Click-to-chat links active' },
        emailService: { status: 'Disabled', message: 'Using WhatsApp instead' },
        pendingApprovals: stats.pendingBookings,
        totalRevenue: stats.totalRevenue,
        totalBookings: stats.totalBookings
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
