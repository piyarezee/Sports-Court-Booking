const express = require('express');
const fs = require('fs');
const path = require('path');
const { oauth2Client, getAuthUrl, setCredentials } = require('../config/google');

const router = express.Router();
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

// Load token from env (preferred) or file
function loadCredentials() {
  // 1. From environment variable (best for Render)
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    const tokens = {
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      access_token: process.env.GOOGLE_ACCESS_TOKEN || undefined,
      token_type: 'Bearer',
      scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
    };
    setCredentials(tokens);
    console.log('✅ Google credentials loaded from environment variables');
    return true;
  }

  // 2. From token.json file (local development)
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      setCredentials(tokens);
      console.log('✅ Google token loaded from token.json');
      return true;
    }
  } catch (err) {
    console.error('Error loading token file:', err.message);
  }

  return false;
}

// Load on startup
const isAuthenticated = loadCredentials();

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

    // Save to file (works on local, temporary on Render)
    try {
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    } catch (e) {
      console.warn('Could not write token.json:', e.message);
    }

    // Show refresh_token so user can copy it to Render env
    const refreshToken = tokens.refresh_token || '(already granted previously - check previous auth)';

    res.send(`
      <html>
        <head><title>Auth Success</title>
        <style>
          body { font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; word-break: break-all; }
          .box { background: #f0fdf4; border: 1px solid #86efac; padding: 16px; border-radius: 12px; margin: 16px 0; }
          .warn { background: #fff7ed; border: 1px solid #fdba74; padding: 16px; border-radius: 12px; margin: 16px 0; }
        </style>
        </head>
        <body>
          <h2>✅ Google Authorization Successful!</h2>
          
          <div class="box">
            <p><strong>For Render (Production):</strong></p>
            <p>Copy this <strong>Refresh Token</strong> and add it as environment variable:</p>
            <p><strong>Key:</strong> <code>GOOGLE_REFRESH_TOKEN</code></p>
            <p><strong>Value:</strong></p>
            <p><code>${refreshToken}</code></p>
          </div>

          <div class="warn">
            <p>1. Render Dashboard → Environment → Add <code>GOOGLE_REFRESH_TOKEN</code></p>
            <p>2. Paste the value above</p>
            <p>3. Save &amp; restart the service</p>
            <p>4. Then check <a href="/auth/status">/auth/status</a></p>
          </div>

          <p>You can close this window after copying the token.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).send('Authentication failed: ' + err.message);
  }
});

// Check auth status
router.get('/status', (req, res) => {
  const hasEnvToken = !!process.env.GOOGLE_REFRESH_TOKEN;
  const hasFileToken = fs.existsSync(TOKEN_PATH);
  const hasMemoryToken = !!(oauth2Client.credentials && (oauth2Client.credentials.refresh_token || oauth2Client.credentials.access_token));

  const authenticated = hasEnvToken || hasFileToken || hasMemoryToken;

  res.json({
    authenticated,
    sources: {
      environment: hasEnvToken,
      file: hasFileToken,
      memory: hasMemoryToken
    },
    message: authenticated
      ? 'Google account is connected'
      : 'Not authenticated. Visit /auth/google to connect.'
  });
});

module.exports = router;
