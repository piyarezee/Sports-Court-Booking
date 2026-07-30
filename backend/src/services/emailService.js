const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

/**
 * Send booking submitted confirmation (to customer)
 */
async function sendBookingSubmittedEmail({ to, name, courtName, date, slot, amount, bookingId }) {
  const mailOptions = {
    from: `"Sports Court Booking" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Booking Submitted - ${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Booking Submitted Successfully</h2>
        <p>Hi ${name},</p>
        <p>Your booking request has been received and is <strong>pending admin approval</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Booking ID</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${bookingId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Court</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${courtName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Date</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Time</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${slot}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Amount</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Rs. ${amount}</td>
          </tr>
        </table>

        <p>You will receive another email once your booking is approved or rejected.</p>
        <p style="color: #666; font-size: 13px;">Thank you for choosing us!</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Send booking approved/rejected email
 */
async function sendBookingStatusEmail({ to, name, courtName, date, slot, status, bookingId, notes }) {
  const isApproved = status === 'approved';
  const color = isApproved ? '#16a34a' : '#dc2626';
  const title = isApproved ? 'Booking Confirmed!' : 'Booking Rejected';

  const mailOptions = {
    from: `"Sports Court Booking" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${title} - ${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">${title}</h2>
        <p>Hi ${name},</p>
        <p>Your booking has been <strong>${status}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Booking ID</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${bookingId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Court</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${courtName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Date</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Time</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${slot}</td>
          </tr>
        </table>

        ${notes ? `<p><strong>Note:</strong> ${notes}</p>` : ''}
        <p style="color: #666; font-size: 13px;">Thank you!</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendBookingSubmittedEmail,
  sendBookingStatusEmail
};
