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
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full filter blur-[120px]"></div>
      
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-slate-300 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Booking Requests</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Review and manage customer bookings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="inline-flex p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl mb-8 shadow-sm">
          {filters.map(f => (
            <Link key={f.key} to={`/admin/bookings${f.key === 'all' ? '' : `?status=${f.key}`}`}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out ${statusFilter === f.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              {f.label}
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/10 animate-pulse">
                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/10 rounded-full"></div><div className="flex-1 space-y-2"><div className="h-4 bg-white/10 rounded w-1/4"></div><div className="h-3 bg-white/10 rounded w-1/3"></div></div></div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-dashed border-white/20">
            <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-white font-semibold">No bookings here</h3>
            <p className="text-slate-400 text-sm mt-1">When customers book, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-shadow duration-300 overflow-hidden">
                <div className="p-5 sm:p-6 bg-slate-900/20">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 border border-white/30">
                        {b.customerName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-white drop-shadow-md">{b.customerName}</h3>
                          <StatusBadge status={b.status} />
                        </div>
                        <a href={`https://wa.me/${formatWhatsAppNumber(b.mobile)}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 px-3 py-1.5 rounded-full font-semibold text-sm border border-green-400/40 transition-colors w-fit shadow-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          {b.mobile}
                        </a>
                        <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-300">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                          <span className="truncate">{b.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 sm:gap-1 text-xs text-slate-300">
                      <span className="font-mono bg-white/10 px-2 py-1 rounded border border-white/20">#{b.id}</span>
                      {b.paymentScreenshot && (
                        <a href={b.paymentScreenshot} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium hover:underline">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Receipt
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Court</p><p className="font-semibold text-white">{b.courtName}</p></div>
                    <div><p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Date</p><p className="font-semibold text-white">{b.date}</p></div>
                    <div><p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Time</p><p className="font-semibold text-white">{b.slotStart} - {b.slotEnd}</p></div>
                    <div><p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Amount</p><p className="font-semibold text-white">Rs. {b.amount}</p></div>
                    <div className="col-span-2 sm:col-span-4">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Payment Method</p>
                      <p className="font-semibold text-white bg-white/5 w-fit px-3 py-1 rounded-md border border-white/10">{b.paymentMethod || 'N/A'}</p>
                    </div>
                  </div>

                  {b.status === 'pending' && (
                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                      <button onClick={() => handleStatus(b, 'approved')} disabled={actionLoading === b.id} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        {actionLoading === b.id ? 'Processing...' : 'Approve & Notify'}
                      </button>
                      <button onClick={() => handleStatus(b, 'rejected')} disabled={actionLoading === b.id} className="flex-1 sm:flex-initial bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-red-500/30 hover:border-red-400/40 font-semibold py-3 px-6 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        Reject
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
    pending: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    approved: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    rejected: 'bg-red-400/20 text-red-300 border-red-400/40'
  }
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-sm ${styles[status] || 'bg-slate-400/20 text-slate-300 border-slate-400/40'}`}>
      {status}
    </span>
  )
}
