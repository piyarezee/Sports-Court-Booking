# Sports Court Booking System - Version 1.0 (LOCKED)

Mobile-first web booking system for sports courts with **no customer registration**.

## Project Goal
Home → Select Court → Select Date → Select Slot → Enter Name, Mobile, Email → Upload Payment Screenshot → Submit → Admin Approval → Confirmation Email

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Storage**: Google Sheets (Customers, Courts, Bookings, Settings)
- **Media**: Google Drive (payment screenshots)
- **Email**: Nodemailer + Gmail

## Prerequisites
- Node.js 18+ 
- Google Cloud project with Sheets API + Drive API enabled
- OAuth 2.0 Client ID (Desktop app) **or** Service Account
- Gmail App Password
- Google Sheet with 4 tabs: `Customers`, `Courts`, `Bookings`, `Settings`

## Project Structure
```
sports-court-booking/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Node.js + Express
├── .env.example
└── README.md
```

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables
See `backend/.env.example` for required variables.

## Development Phases
1. ✅ Project setup
2. Frontend
3. Backend & Google APIs
4. Admin panel
5. Testing & Deployment

---
**Status**: Baseline requirements frozen (Version 1.0 LOCKED)
