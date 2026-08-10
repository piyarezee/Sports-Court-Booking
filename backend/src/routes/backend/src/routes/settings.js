
const express = require('express');
const sheetsService = require('../services/sheetsService');
const router = express.Router();

router.get('/', async (req, res) => {
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
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
