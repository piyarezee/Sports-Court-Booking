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
  // If sheet name has space or hyphen, wrap in single quotes
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
    range: getRange(SHEETS.BOOKINGS, `A${rowNum}:O${rowNum}`)
  });

  const row = response.data.values[0];
  row[11] = status; 
  if (notes) row[13] = notes;

  await updateRow(SHEETS.BOOKINGS, rowNum, row);
  
  if (status === 'approved') {
    await appendRow(SHEETS.PAYMENTS, [
      `PAY-${Date.now()}`,
      bookingId,
      row[6], // Customer Name
      row[9], // Amount
      'Online / Transfer',
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
  if (existing) {
    return existing;
  }

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
    id,
    walkIn.customerName,
    walkIn.mobile,
    walkIn.courtName,
    walkIn.date,
    walkIn.time,
    walkIn.amount,
    'Completed'
  ]);

  await appendRow(SHEETS.PAYMENTS, [
    `PAY-${Date.now()}`,
    id,
    walkIn.customerName,
    walkIn.amount,
    'Cash',
    'Received',
    createdAt
  ]);

  return { id, ...walkIn, status: 'Completed' };
}

// ========== CONTACT ==========
async function createContactMessage({ name, email, message }) {
  const id = `MSG-${Date.now()}`;
  const createdAt = new Date().toISOString();
  
  await appendRow(SHEETS.CONTACT, [id, name, email, message, createdAt]);
  return { id, name, email, message, createdAt };
}

// ========== REPORTS ==========
async function getDashboardStats() {
  const bookings = await getBookings();
  const payments = await getSheetData(SHEETS.PAYMENTS);
  
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const approvedBookings = bookings.filter(b => b.status === 'approved').length;
  
  const totalRevenue = payments
    .filter(p => p.status && p.status.toLowerCase() === 'received')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return {
    totalBookings,
    pendingBookings,
    approvedBookings,
    totalRevenue
  };
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
  appendRow,
  createWalkIn,
  createContactMessage,
  getDashboardStats
};