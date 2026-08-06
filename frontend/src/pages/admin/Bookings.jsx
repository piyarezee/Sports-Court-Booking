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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-slate-500 hover:text-slate-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Booking Requests</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Review and manage customer bookings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Segmented Control Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl mb-8 shadow-sm">
          {filters.map(f => (
            <Link
              key={f.key}
              to={`/admin/bookings${f.key === 'all' ? '' : `?status=${f.key}`}`}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out
                ${statusFilter === f.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{error}</div>}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="h-8 bg-slate-100 rounded col-span-1"></div>
                  <div className="h-8 bg-slate-100 rounded col-span-1"></div>
                  <div className="h-8 bg-slate-100 rounded col-span-1"></div>
                  <div className="h-8 bg-slate-100 rounded col-span-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-slate-900 font-semibold">No bookings here</h3>
            <p className="text-slate-500 text-sm mt-1">When customers book, they will appear here.</p>
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                        {b.customerName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-900">{b.customerName}</h3>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="flex flex-col mt-1 text-sm text-slate-500 space-y-1">
                          <a href={`https://wa.me/${formatWhatsAppNumber(b.mobile)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-green-600 transition-colors w-fit">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {b.mobile}
                          </a>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                            <span className="truncate">{b.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 sm:gap-1 text
