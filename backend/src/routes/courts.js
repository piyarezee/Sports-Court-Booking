const express = require('express');
const sheetsService = require('../services/sheetsService');

const router = express.Router();

// GET /api/courts - List all active courts
router.get('/', async (req, res) => {
  try {
    const courts = await sheetsService.getCourts();
    res.json({ success: true, data: courts });
  } catch (err) {
    console.error('Get courts error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/courts/:id - Get single court
router.get('/:id', async (req, res) => {
  try {
    const court = await sheetsService.getCourtById(req.params.id);
    if (!court) {
      return res.status(404).json({ success: false, error: 'Court not found' });
    }
    res.json({ success: true, data: court });
  } catch (err) {
    console.error('Get court error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/courts/:id/slots?date=YYYY-MM-DD - Available slots
router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, error: 'date query param required' });
    }

    const court = await sheetsService.getCourtById(id);
    if (!court) {
      return res.status(404).json({ success: false, error: 'Court not found' });
    }

    // Get existing bookings for this court + date
    const bookings = await sheetsService.getBookingsByDateAndCourt(id, date);
    const bookedStarts = bookings.map(b => b.slotStart);

    // Generate slots 8:00 - 22:00
    const slots = [];
    for (let hour = 8; hour <= 21; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
      const isBooked = bookedStarts.includes(start);

      slots.push({
        id: `${date}-${start}`,
        start,
        end,
        label: `${start} - ${end}`,
        isBooked,
        price: court.pricePerHour
      });
    }

    res.json({
      success: true,
      data: {
        court,
        date,
        slots
      }
    });
  } catch (err) {
    console.error('Get slots error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
