const express = require('express');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const sheetsService = require('../services/sheetsService');
const driveService = require('../services/driveService');
const emailService = require('../services/emailService');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/bookings - Create new booking
router.post('/', upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const { courtId, date, slotStart, slotEnd, customerName, mobile, email } = req.body;

    if (!courtId || !date || !slotStart || !customerName || !mobile || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Payment screenshot is required'
      });
    }

    const court = await sheetsService.getCourtById(courtId);
    if (!court) {
      return res.status(404).json({ success: false, error: 'Court not found' });
    }

    // Check if slot already booked
    const existing = await sheetsService.getBookingsByDateAndCourt(courtId, date);
    if (existing.some(b => b.slotStart === slotStart)) {
      return res.status(409).json({
        success: false,
        error: 'This slot is already booked'
      });
    }

    let paymentUrl = '';
    try {
      const uploaded = await driveService.uploadFile(
        req.file.path,
        `payment-${mobile}-${Date.now()}${path.extname(file.originalname)}`
      );
      paymentUrl = uploaded.webContentLink || uploaded.webViewLink;
    } catch (driveErr) {
      console.error('Drive upload failed, using local path:', driveErr.message);
      paymentUrl = `/uploads/${req.file.filename}`;
    }

    const bookingId = `SCB-${Date.now()}`;
    const qrCodeDataUrl = await QRCode.toDataURL(bookingId, { width: 200 });

    // Agar slotEnd na aaye, to 1 ghanta add karke bana lein (fallback)
    const finalSlotEnd = slotEnd || `${String(Number(slotStart.split(':')[0]) + 1).padStart(2, '0')}:00`;

    await sheetsService.upsertCustomer({
      name: customerName,
      mobile: mobile.replace(/[\s-]/g, ''),
      email
    });

    const booking = await sheetsService.createBooking({
      bookingId,
      qrCode: qrCodeDataUrl,
      courtId,
      courtName: court.name,
      date,
      slotStart,
      slotEnd: finalSlotEnd, // Yahan frontend se aayi value use hogi
      customerName,
      mobile: mobile.replace(/[\s-]/g, ''),
      email,
      amount: court.pricePerHour, // Note: Agar amount backend par calculate karna hai, toh duration bhi bhejni hogi
      paymentScreenshot: paymentUrl
    });

    try {
      await emailService.sendBookingSubmittedEmail({
        to: email,
        name: customerName,
        courtName: court.name,
        date,
        slot: `${slotStart} - ${finalSlotEnd}`,
        amount: court.pricePerHour,
        bookingId: bookingId,
        qrCode: qrCodeDataUrl
      });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully. Pending admin approval.',
      data: booking
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await sheetsService.getBookings();
    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error('Get bookings error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
