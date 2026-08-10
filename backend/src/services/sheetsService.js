const { getSheetsClient } = require('../config/google');
require('dotenv').config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Sheet names
const SHEETS = {
  CUSTOMERS: 'Customers',
  COURTS: 'Courts',
  BOOKINGS: 'Bookings',
  SETTINGS: 'Settings',
  PAYMENTS: 'Payments',
  WALK_INS: 'Walk-ins',
  CONTACT: 'Contact',
  DAILY_REPORT: 'Daily_Report',
  MONTHLY_REPORT: 'Monthly_Report'
};

// Helper to safely format sheet range
function getRange(sheetName, cellRange = 'A:Z') {
  const safeName = /[\s\-]/.test(sheetName) ? `'${sheetName}'` : sheetName;
  return `${safeName}!${cellRange}`;
}

/**
 * Read all rows from a sheet
 */
async function getSheetData(sheetName) {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: getRange(sheetName)
  });

  const rows = response.data.values || [];
  if (rows.length === 0) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

/**
 * Append a row to a sheet
 */
async function appendRow(sheetName, values) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: getRange(sheetName),
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values]
    }
  });
}

/**
 * Update a specific row
 */
async function updateRow(sheetName, rowNumber, values) {
  const sheets = getSheetsClient();
  const range = getRange(sheetName, `A${rowNumber}:Z${rowNumber}`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values]
    }
  });
}

/**
 * Find row number by a column value
 */
async function findRowNumber(sheetName, columnIndex, value) {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: getRange(sheetName)
  });

  const rows = response.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i][columnIndex] || '').toString() === value.toString()) {
      return i + 1; 
    }
  }
  return null;
}

// ========== COURTS ==========
async function getCourts() {
  const data = await getSheetData(SHEETS.COURTS);
  return data
    .map(c => ({
      id: String(c.id || '').trim(),
      name: c.name,
      type: c.type,
      location: c.location,
      pricePerHour: Number(c.price_per_hour) || 0,
      image: c.image || '',
      description: c.description || '',
      amenities: c.amenities ? c.amenities.split(',').map(a => a.trim()) : [],
      youtubeUrl: c.youtube_url || '',
      gallery: c.gallery || '',
      mapUrl: c.map_url || '',
      isActive: String(c.is_active || '').toLowerCase() !== 'false' && String(c.is_active || '') !== '0'
    }))
    .filter(c => c.id && c.isActive);
}

async function getCourtById(id) {
  const courts = await getCourts();
  const cleanId = String(id || '').trim();
  return courts.find(c => c.id === cleanId) || null;
}

// ========== BOOKINGS ==========
async function getBookings() {
  const data = await getSheetData(SHEETS.BOOKINGS);
  return data.map(b => ({
    id: b.booking_id || b.id,
    bookingId: b.booking_id || b.id,
    courtId: String(b.court_id || '').trim(),
    courtName: b.court_name,
    date: String(b.date || '').trim(),
    slotStart: String(b.slot_start || '').trim(),
    slotEnd: String(b.slot_end || '').trim(),
    customerName: b.customer_name,
    mobile: b.mobile,
    email: b.email,
    amount: Number(b.amount) || 0,
    paymentScreenshot: b.payment_screenshot || '',
    paymentMethod: b.payment_method || 'Not Specified', // Added payment method
    status: b.status || 'pending',
    createdAt: b.created_at,
    notes: b.notes || '',
    qrCode: b.qr_code || ''
  }));
}

async function getBookingsByDateAndCourt(courtId, date) {
  const bookings = await getBookings();
  const cleanCourtId = String(courtId || '').trim();
  const cleanDate = String(date || '').trim();
  
  return bookings.filter(
    b => b.courtId === cleanCourtId && b.date === cleanDate && b.status !== 'rejected'
  );
}

async function createBooking(booking) {
  const internalId = `BK${Date.now()}`;
  const createdAt = new Date().toISOString();

  await appendRow(SHEETS.BOOKINGS, [
    booking.bookingId,
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
    booking.qrCode || '',
    booking.paymentMethod || 'Not Specified' // Saving Payment Method in Column P
  ]);

  return { id: booking.bookingId, ...booking, status: 'pending', createdAt };
}

async function updateBookingStatus(bookingId, status, notes = '') {
  const rowNum = await findRowNumber(SHEETS.BOOKINGS, 0, bookingId);
  if (!rowNum) throw new Error('Booking not found');

  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: getRange(SHEETS.BOOKINGS, `A${rowNum}:P${rowNum}`) // Extended to P
  });

  const row = response.data.values[0];
  row[11] = status; // status column (L = index 11)
  if (notes) row[13] = notes; // notes column (N = index 13)

  await updateRow(SHEETS.BOOKINGS, rowNum, row);
  
  if (status === 'approved') {
    await appendRow(SHEETS.PAYMENTS, [
      `PAY-${Date.now()}`,
      bookingId,
      row[6], // Customer Name
      row[9], // Amount
      row[15] || 'Online / Transfer', // Payment Method (Column P = index 15)
      'Received',
      new Date().toISOString()
    ]);
  }

  return { id: bookingId, status, notes };
}

// ========== CUSTOMERS ==========
async function findCustomerByMobile(mobile) {
  const data = await getSheetData(SHEETS.CUSTOMERS);
  return data.find(c => c.mobile === mobile) || null;
}

async function upsertCustomer({ name, mobile, email }) {
  const existing = await findCustomerByMobile(mobile);
  if (existing) return existing;

  const id = `CU${Date.now()}`;
  const createdAt = new Date().toISOString();
  await appendRow(SHEETS.CUSTOMERS, [id, name, mobile, email, createdAt]);
  return { id, name, mobile, email, created_at: createdAt };
}

// ========== WALK-INS ==========
async function createWalkIn(walkIn) {
  const id = `WI-${Date.now()}`;
  const createdAt = new Date().toISOString();
  
  await appendRow(SHEETS.WALK_INS, [
    id, walkIn.customerName, walkIn.mobile, walkIn.courtName,
    walkIn.date, walkIn.time, walkIn.amount, 'Completed'
