import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CourtDetail from './pages/CourtDetail'
import SlotSelection from './pages/SlotSelection'
import BookingForm from './pages/BookingForm'
import Success from './pages/Success'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminBookings from './pages/admin/Bookings'
import WalkIn from './pages/WalkIn'
import Payments from './pages/Payments'
import ContactMessages from './pages/ContactMessages'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<Home />} />
        <Route path="/court/:id" element={<CourtDetail />} />
        <Route path="/court/:id/slots" element={<SlotSelection />} />
        <Route path="/book" element={<BookingForm />} />
        <Route path="/success" element={<Success />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        
        {/* New Admin Routes */}
        <Route path="/admin/walk-in" element={<WalkIn />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/contact" element={<ContactMessages />} />
      </Routes>
    </div>
  )
}

export default App