/**
 * Send booking submitted confirmation (to customer)
 */
async function sendBookingSubmittedEmail({ to, name, courtName, date, slot, amount, bookingId, qrCode }) {
  // Convert Data URL to Buffer for email attachment
  const base64Data = qrCode.split(',')[1];
  const qrBuffer = Buffer.from(base64Data, 'base64');

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

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Show the attached QR code at the court for check-in:</p>
          <img src="cid:qrcode@example.com" alt="Booking QR Code" style="width: 180px; height: 180px; border: 1px solid #ddd; padding: 10px; border-radius: 8px;" />
        </div>

        <p>You will receive another email once your booking is approved or rejected.</p>
        <p style="color: #666; font-size: 13px;">Thank you for choosing us!</p>
      </div>
    `,
    attachments: [{
      filename: `${bookingId}-qrcode.png`,
      content: qrBuffer,
      cid: 'qrcode@example.com' // Same cid as in img src
    }]
  };

  await transporter.sendMail(mailOptions);
}