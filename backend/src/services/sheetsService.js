// ========== BOOKINGS ==========
async function getBookings() {
  const data = await getSheetData(SHEETS.BOOKINGS);
  return data.map(b => ({
    id: b.id,
    bookingId: b.booking_id || b.id, // Support new bookingId
    courtId: b.court_id,
    courtName: b.court_name,
    date: b.date,
    slotStart: b.slot_start,
    slotEnd: b.slot_end,
    customerName: b.customer_name,
    mobile: b.mobile,
    email: b.email,
    amount: Number(b.amount) || 0,
    paymentScreenshot: b.payment_screenshot || '',
    status: b.status || 'pending',
    createdAt: b.created_at,
    notes: b.notes || '',
    qrCode: b.qr_code || ''
  }));
}

async function getBookingsByDateAndCourt(courtId, date) {
  const bookings = await getBookings();
  return bookings.filter(
    b => b.courtId === courtId && b.date === date && b.status !== 'rejected'
  );
}

async function createBooking(booking) {
  const id = `BK${Date.now()}`; // Internal row ID
  const createdAt = new Date().toISOString();

  // Append row with new bookingId and qrCode columns
  await appendRow(SHEETS.BOOKINGS, [
    booking.bookingId, // Booking ID (e.g. SCB-12345)
    booking.courtId,
    booking.courtName,
    booking.date,
    booking.slotStart,
    booking.slotEnd,
    booking.customerName,
    booking.mobile,
    booking.email,
    booking.amount,
    booking.paymentScreenshot || '',
    'pending',
    createdAt,
    booking.notes || '',
    booking.qrCode || '' // QR Code Data URL
  ]);

  return { id, ...booking, status: 'pending', createdAt };
}