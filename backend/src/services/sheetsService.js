const { getSheetsClient } = require('../config/google');
require('dotenv').config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Sheet names
const SHEETS = {
  CUSTOMERS: 'Customers',
  COURTS: 'Courts',
  BOOKINGS: 'Bookings',
  SETTINGS: 'Settings'
};

/**
 * Read all rows from a sheet (assuming first row is header)
 */
async function getSheetData(sheetName) {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`
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
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values]
    }
  });
}

/**
 * Update a specific row (by row number, 1-indexed including header)
 */
async function updateRow(sheetName, rowNumber, values) {
  const sheets = getSheetsClient();
  const range = `${sheetName}!A${rowNumber}:Z${rowNumber}`;
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
 * Find row number by a column value (returns 1-indexed row including header, or null)
 */
async function findRowNumber(sheetName, columnIndex, value) {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`
  });

  const rows = response.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i][columnIndex] || '').toString() === value.toString()) {
      return i + 1; // 1-indexed
    }
  }
  return null;
}

// ========== COURTS ==========
async function getCourts() {
  const data = await getSheetData(SHEETS.COURTS);
  return data
    .filter(c => c.is_active !== 'FALSE' && c.is_active !== 'false' && c.is_active !== '0')
    .map(c => ({
      id: c.id,
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
      isActive: true
    }));
}
async function getCourtById(id) {
  const courts = await getCourts();
  return courts.find(c => c.id === id) || null;
}

// ========== BOOKINGS ==========
async function getBookings() {
  const data = await getSheetData(SHEETS.BOOKINGS);
  return data.map(b => ({
    id: b.booking_id || b.id,
    bookingId: b.booking_id || b.id,
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
    booking.qrCode || ''
  ]);

  return { 
    id: booking.bookingId, 
    ...booking, 
    status: 'pending', 
    createdAt 
  };
}

async function updateBookingStatus(bookingId, status, notes = '') {
  const rowNum = await findRowNumber(SHEETS.BOOKINGS, 0, bookingId);
  if (!rowNum) throw new Error('Booking not found');

  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.BOOKINGS}!A${rowNum}:O${rowNum}`
  });

  const row = response.data.values[0];
  row[11] = status; // status column (L = index 11)
  if (notes) row[13] = notes;

  await updateRow(SHEETS.BOOKINGS, rowNum, row);
  return { id: bookingId, status, notes };
}

// ========== CUSTOMERS ==========
async function findCustomerByMobile(mobile) {
  const data = await getSheetData(SHEETS.CUSTOMERS);
  return data.find(c => c.mobile === mobile) || null;
}

async function upsertCustomer({ name, mobile, email }) {
  const existing = await findCustomerByMobile(mobile);
  if (existing) {
    return existing;
  }

  const id = `CU${Date.now()}`;
  const createdAt = new Date().toISOString();
  await appendRow(SHEETS.CUSTOMERS, [id, name, mobile, email, createdAt]);
  return { id, name, mobile, email, created_at: createdAt };
}

// ========== SETTINGS ==========
async function getSettings() {
  const data = await getSheetData(SHEETS.SETTINGS);
  const settings = {};
  data.forEach(row => {
    if (row.key) settings[row.key] = row.value;
  });
  return settings;
}

module.exports = {
  SHEETS,
  getCourts,
  getCourtById,
  getBookings,
  getBookingsByDateAndCourt,
  createBooking,
  updateBookingStatus,
  findCustomerByMobile,
  upsertCustomer,
  getSettings,
  getSheetData,
  appendRow
};