const express = require('express');
const sheetsService = require('../services/sheetsService');
const router = express.Router();

// POST /api/contact - Public route for contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const contact = await sheetsService.createContactMessage({ name, email, message });
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;