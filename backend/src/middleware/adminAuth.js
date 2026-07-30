require('dotenv').config();

// Simple token-based auth for V1
// In production you would use JWT, but for locked V1 we keep it simple

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  // Simple token = base64 of email:password (V1 only)
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [email, password] = decoded.split(':');

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      req.admin = { email };
      return next();
    }
  } catch (err) {
    // ignore
  }

  return res.status(401).json({ success: false, error: 'Invalid credentials' });
}

module.exports = adminAuth;
