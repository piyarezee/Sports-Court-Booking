const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const sheetsService = require('../services/sheetsService');
const emailService = require('../services/emailService');

const router = express.Router();

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = Buffer.from(`${email}:${password}`).toString('base64');
    return res.json({
      success: true,
      token,
      admin: { email }
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid email or password' });
});

// All routes below require admin auth
router.use(adminAuth);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const bookings = await sheetsService.getBookings();
    const courts = await sheetsService.getCourts();

    const pending = bookings.filter(b => b.status === 'pending').length;
    const approved = bookings.filter(b => b.status === 'approved').length;
    const rejected = bookings.filter(b => b.status === 'rejected').length;

    res.json({
      success: true,
      data: {
        totalBookings: bookings.length,
        pending,
        approved,
        rejected,
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

    if (status && status !== 'all') {
      bookings = bookings.filter(b => b.status === status);
    }

    // newest first
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
      return res.status(400).json({
        success: false,
        error: 'Status must be approved or rejected'
      });
    }

    const updated = await sheetsService.updateBookingStatus(id, status, notes || '');

    // Get full booking to send email
    const allBookings = await sheetsService.getBookings();
    const booking = allBookings.find(b => b.id === id);

    if (booking) {
      try {
        await emailService.sendBookingStatusEmail({
          to: booking.email,
          name: booking.customerName,
          courtName: booking.courtName,
          date: booking.date,
          slot: `${booking.slotStart} - ${booking.slotEnd}`,
          status,
          bookingId: id,
          notes: notes || ''
        });
      } catch (emailErr) {
        console.error('Status email failed:', emailErr.message);
      }
    }

    res.json({
      success: true,
      message: `Booking ${status}`,
      data: updated
    });
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

module.exports = router;
