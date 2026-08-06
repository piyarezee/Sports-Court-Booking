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

  // Helper function to format PK mobile number for WhatsApp (03XX -> 92XX)
  const formatWhatsAppNumber = (mobile) => {
    let cleanMobile = mobile.replace(/[\s-]/g, '')
    if (cleanMobile.startsWith('03')) {
      return '92' + cleanMobile.substring(1)
    }
    if (cleanMobile.startsWith('+92')) {
      return cleanMobile.substring(1)
    }
    return cleanMobile
  }

  // Helper function to generate WhatsApp link with pre-filled message
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

    // 1. Sabse pehle WhatsApp Link banao aur turant naye tab mein kholo
    const waLink = generateWhatsAppLink(booking, status, notes)
    window.open(waLink, '_blank')

    // 2. Ab backend pe status update karo
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
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/admin" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-gray-900">Bookings</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map(f => (
            <Link
              key={f.key}
              to={`/admin/bookings${f.key === 'all' ? '' : `?status=${f.key}`}`}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
                ${statusFilter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }
              `}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No bookings found</p>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{b.customerName}</p>
                    <p className="text-sm text-gray-500">{b.mobile} · {b.email}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-400 text-xs">Court</p>
                    <p className="font-medium text-gray-800">{b.courtName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Date</p>
                    <p className="font-medium text-gray-800">{b.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Time</p>
                    <p className="font-medium text-gray-800">{b.slotStart} - {b.slotEnd}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Amount</p>
                    <p className="font-medium text-gray-800">Rs. {b.amount}</p>
                  </div>
                </div>

                {b.paymentScreenshot && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">Payment Screenshot</p>
                    <a
                      href={b.paymentScreenshot}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      View Screenshot →
                    </a>
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-3">ID: {b.id}</p>

                {b.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatus(b, 'approved')}
                      disabled={actionLoading === b.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {actionLoading === b.id ? '...' : 'Approve & WhatsApp'}
                    </button>
                    <button
                      onClick={() => handleStatus(b, 'rejected')}
                      disabled={actionLoading === b.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      Reject & WhatsApp
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
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700'
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  )
}
