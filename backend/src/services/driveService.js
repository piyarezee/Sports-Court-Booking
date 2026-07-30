const { getDriveClient } = require('../config/google');
const fs = require('fs');
const path = require('path');

/**
 * Upload a file to Google Drive
 * @param {string} filePath - Local path of the file
 * @param {string} fileName - Desired name on Drive
 * @returns {Promise<{id: string, webViewLink: string, webContentLink: string}>}
 */
async function uploadFile(filePath, fileName) {
  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [] // root, or set a folder ID later
    },
    media: {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(filePath)
    },
    fields: 'id, webViewLink, webContentLink'
  });

  // Make file publicly viewable (optional, for admin to see easily)
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  });

  return {
    id: response.data.id,
    webViewLink: response.data.webViewLink,
    webContentLink: `https://drive.google.com/uc?id=${response.data.id}`
  };
}

/**
 * Delete local temp file after upload
 */
function cleanupLocalFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
}

module.exports = {
  uploadFile,
  cleanupLocalFile
};
