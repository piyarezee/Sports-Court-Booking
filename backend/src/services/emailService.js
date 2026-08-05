const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

// Brevo Client Setup
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send booking submitted confirmation (to customer)
 */
async function sendBookingSubmittedEmail({ to, name, courtName, date, slot, amount, bookingId, qrCode }) {
  // Brevo mein inline attachments ke liye base64 string chahiye hoti hai (bina data:image/png;base64, ke)
  const base64Data = qrCode.split(',')[1];

  const sendSmtpEmail = {
    sender: { name: 'Sports Court Booking', email: process.env.EMAIL_USER },
    to: [{ email: to, name: name }],
    subject: `Booking Submitted - ${bookingId}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Booking Submitted Successfully</h2>
        <p>Hi ${name},</p>
        <p>Your booking request has been received and is <strong>pending admin approval</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Booking ID</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${bookingId}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Court</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${courtName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Time</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${slot}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Amount</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Rs. ${amount}</td></tr>
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Show the attached QR code at the court for check-in:</p>
          <img src="cid:qrcode" alt="Booking QR Code" style="width: 180px; height: 180px; border: 1px solid #ddd; padding: 10px; border-radius: 8px;" />
        </div>

        <p>You will receive another email once your booking is approved or rejected.</p>
        <p style="color: #666; font-size: 13px;">Thank you for choosing us!</p>
      </div>
    `,
    attachment: [{
      name: `${bookingId}-qrcode.png`,
      content: base64Data,
      contentType: 'image/png',
      contentId: 'qrcode'
    }]
  };

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

/**
 * Send booking approved/rejected email
 */
async function sendBookingStatusEmail({ to, name, courtName, date, slot, status, bookingId, notes }) {
  const isApproved = status === 'approved';
  const color = isApproved ? '#16a34a' : '#dc2626';
  const title = isApproved ? 'Booking Confirmed!' : 'Booking Rejected';

  const sendSmtpEmail = {
    sender: { name: 'Sports Court Booking', email: process.env.EMAIL_USER },
    to: [{ email: to, name: name }],
    subject: `${title} - ${bookingId}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">${title}</h2>
        <p>Hi ${name},</p>
        <p>Your booking has been <strong>${status}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Booking ID</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${bookingId}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Court</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${courtName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Time</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${slot}</td></tr>
        </table>

        ${notes ? `<p><strong>Note:</strong> ${notes}</p>` : ''}
        <p style="color: #666; font-size: 13px;">Thank you!</p>
      </div>
    `
  };

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

module.exports = {
  sendBookingSubmittedEmail,
  sendBookingStatusEmail
};
