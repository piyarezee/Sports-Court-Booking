import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function AdminBookings() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') || 'all'

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')

  const token = localStorage.getItem('adminToken')

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    loadBookings()
  }, [statusFilter])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/admin/bookings`, {
        params: { status: statusFilter },
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(res.data.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken')
        navigate('/admin/login')
      } else {
        setError(err.response?.data?.error || 'Failed to load bookings')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatWhatsAppNumber = (mobile) => {
    let cleanMobile = mobile.replace(/[\s-]/g, '')
    if (cleanMobile.startsWith('03')) return '92' + cleanMobile.substring(1)
    if (cleanMobile.startsWith('+92')) return cleanMobile.substring(1)
    return cleanMobile
  }

  const generateWhatsAppLink = (booking, status, notes = '') => {
    const phone = formatWhatsAppNumber(booking.mobile)
    let message = ''

    if (status === 'approved') {
      message = `*Booking Confirmed!* ✅\n\nHi ${booking.customerName},\nYour booking for *${booking.courtName}* on *${booking.date}* at *${booking.slotStart} - ${booking.slotEnd}* has been *APPROVED*.\n\nBooking ID: ${booking.id}\nAmount: Rs. ${booking.amount}\n\nPlease arrive 10 minutes before your time. See you at the court!`
    } else if (status === 'rejected') {
      message = `*Booking Update* ❌\n\nHi ${booking.customerName},\nWe regret to inform you that your booking for *${booking.courtName}* on *${booking.date}* at *${booking.slotStart} - ${booking.slotEnd}* has been rejected.`
      if (notes) message += `\n\nReason: ${notes}`
      message += `\n\nBooking ID: ${booking.id}\nPlease contact us for more details.`
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  const handleStatus = async (booking, status) => {
    let notes = ''
    if (status === 'rejected') {
      notes = prompt('Rejection reason (optional):') || ''
    }

    const waLink = generateWhatsAppLink(booking, status, notes)
    window.open(waLink, '_blank')

    setActionLoading(booking.id)
    try {
      await axios.patch(
        `${API}/admin/bookings/${booking.id}/status`,
        { status, notes: notes || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await loadBookings()
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const filters = [
    { key: 'all', label: 'All Bookings' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
  ]

  // Helper to get initials for Avatar
  const getInitials = (name) => {
    if(!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Manage Bookings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Modern Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {filters.map(f => (
            <Link
              key={f.key}
              to={`/admin/bookings${f.key === 'all' ? '' : `?status=${f.key}`}`}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                ${statusFilter === f.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-900'
                }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto"></div>
            <p className="text-slate-500 mt-3 text-sm">Fetching bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No bookings found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
                
                {/* Card Header */}
                <div className="p-5 flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {getInitials(b.customerName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg text-slate-900 truncate">{b.customerName}</h3>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="flex flex-col mt-1 text-sm text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <a href={`https://wa.me/${formatWhatsAppNumber(b.mobile)}`} target="_blank" rel="noreferrer" className="hover:text-green-600 hover:underline">
                          {b.mobile}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                        <span className="truncate">{b.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body - Details */}
                <div className="px-5 pb-5 flex-1">
                  <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-xs mb-0.5">Court</span>
                      <span className="font-semibold text-slate-800">{b.courtName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-xs mb-0.5">Amount</span>
                      <span className="font-semibold text-slate-800">Rs. {b.amount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-xs mb-0.5">Date</span>
                      <span className="font-semibold text-slate-800">{b.date}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-xs mb-0.5">Time Slot</span>
                      <span className="font-semibold text-slate-800">{b.slotStart} - {b.slotEnd}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 text-xs">
                    <span className="text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">ID: {b.id}</span>
                    {b.paymentScreenshot && (
                      <a href={b.paymentScreenshot} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        View Screenshot
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Footer - Actions */}
                {b.status === 'pending' && (
                  <div className="bg-white border-t border-slate-100 p-4 flex gap-3">
                    <button
                      onClick={() => handleStatus(b, 'approved')}
                      disabled={actionLoading === b.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                      {actionLoading === b.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleStatus(b, 'rejected')}
                      disabled={actionLoading === b.id}
                      className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200'
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize border ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  )
}
