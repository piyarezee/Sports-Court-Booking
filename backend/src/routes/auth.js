const express = require('express');
const fs = require('fs');
const path = require('path');
const { oauth2Client, getAuthUrl, setCredentials } = require('../config/google');

const router = express.Router();
const TOKEN_PATH = path.join(__dirname, '../../token.json');

// Load existing token if available
function loadSavedToken() {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      setCredentials(tokens);
      console.log('✅ Google token loaded from token.json');
      return true;
    }
  } catch (err) {
    console.error('Error loading token:', err.message);
  }
  return false;
}

// Try load on startup
loadSavedToken();

// Step 1: Redirect user to Google consent
router.get('/google', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// Step 2: Google redirects back with code
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    setCredentials(tokens);

    // Save token for future use
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('✅ Google token saved to token.json');

    res.send(`
      <h2>✅ Google Authorization Successful!</h2>
      <p>You can close this window and restart the backend server.</p>
      <p>Token has been saved. APIs will now work.</p>
    `);
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).send('Authentication failed: ' + err.message);
  }
});

// Check auth status
router.get('/status', (req, res) => {
  const hasToken = fs.existsSync(TOKEN_PATH);
  res.json({
    authenticated: hasToken,
    message: hasToken
      ? 'Google account is connected'
      : 'Not authenticated. Visit /auth/google to connect.'
  });
});

module.exports = router;
