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

    // 1. WhatsApp Link turant kholo
    const waLink = generateWhatsAppLink(booking, status, notes)
    window.open(waLink, '_blank')

    // 2. Backend update karo
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
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
                ${statusFilter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No bookings found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{b.customerName}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <a href={`https://wa.me/${formatWhatsAppNumber(b.mobile)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-green-600">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          {b.mobile}
                        </a>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{b.email}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-gray-400 text-xs">Court</p>
                      <p className="font-semibold text-gray-800">{b.courtName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Amount</p>
                      <p className="font-semibold text-gray-800">Rs. {b.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Date</p>
                      <p className="font-semibold text-gray-800">{b.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Time</p>
                      <p className="font-semibold text-gray-800">{b.slotStart} - {b.slotEnd}</p>
                    </div>
                  </div>

                  {b.paymentScreenshot && (
                    <a href={b.paymentScreenshot} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline mb-3 block">
                      View Payment Screenshot →
                    </a>
                  )}

                  <p className="text-xs text-gray-400 mb-4">Booking ID: {b.id}</p>

                  {b.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatus(b, 'approved')}
                        disabled={actionLoading === b.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-50"
                      >
                        {actionLoading === b.id ? '...' : 'Approve & WhatsApp'}
                      </button>
                      <button
                        onClick={() => handleStatus(b, 'rejected')}
                        disabled={actionLoading === b.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-50"
                      >
                        Reject & WhatsApp
                      </button>
                    </div>
                  )}
                </div>
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
