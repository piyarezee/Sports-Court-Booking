const express = require('express');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode'); // Added QR Code package
const sheetsService = require('../services/sheetsService');
const driveService = require('../services/driveService');
const emailService = require('../services/emailService');

const router = express.Router();

// Multer config - store temporarily in uploads/
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
    const { courtId, date, slotStart, customerName, mobile, email } = req.body;

    // Validation
    if (!courtId || !date || !slotStart || !customerName || !mobile || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: courtId, date, slotStart, customerName, mobile, email'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Payment screenshot is required'
      });
    }

    // Get court details
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

    // Upload payment screenshot to Google Drive
    let paymentUrl = '';
    try {
      const uploaded = await driveService.uploadFile(
        req.file.path,
        `payment-${mobile}-${Date.now()}${path.extname(req.file.originalname)}`
      );
      paymentUrl = uploaded.webContentLink || uploaded.webViewLink;
    } catch (driveErr) {
      console.error('Drive upload failed, using local path:', driveErr.message);
      paymentUrl = `/uploads/${req.file.filename}`;
    }

    // Generate Booking ID (e.g., SCB-1718482901)
    const bookingId = `SCB-${Date.now()}`;
    
    // Generate QR Code as Data URL (contains Booking ID)
    const qrCodeDataUrl = await QRCode.toDataURL(bookingId, { width: 200 });

    const slotEnd = `${String(Number(slotStart.split(':')[0]) + 1).padStart(2, '0')}:00`;

    // Upsert customer
    await sheetsService.upsertCustomer({
      name: customerName,
      mobile: mobile.replace(/[\s-]/g, ''),
      email
    });

    // Create booking (passing bookingId and qrCode)
    const booking = await sheetsService.createBooking({
      bookingId,
      qrCode: qrCodeDataUrl,
      courtId,
      courtName: court.name,
      date,
      slotStart,
      slotEnd,
      customerName,
      mobile: mobile.replace(/[\s-]/g, ''),
      email,
      amount: court.pricePerHour,
      paymentScreenshot: paymentUrl
    });

    // Send email (passing bookingId and qrCode)
    try {
      await emailService.sendBookingSubmittedEmail({
        to: email,
        name: customerName,
        courtName: court.name,
        date,
        slot: `${slotStart} - ${slotEnd}`,
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

// GET /api/bookings - List all bookings (for admin later)
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