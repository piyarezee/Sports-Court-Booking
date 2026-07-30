const { google } = require('googleapis');
require('dotenv').config();

// OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback'
);

// Scopes we need
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

// Generate auth URL (for first-time authorization)
function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
}

// Set credentials from tokens
function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
}

// Get authenticated Sheets client
function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: oauth2Client });
}

// Get authenticated Drive client
function getDriveClient() {
  return google.drive({ version: 'v3', auth: oauth2Client });
}

module.exports = {
  oauth2Client,
  getAuthUrl,
  setCredentials,
  getSheetsClient,
  getDriveClient,
  SCOPES
};
