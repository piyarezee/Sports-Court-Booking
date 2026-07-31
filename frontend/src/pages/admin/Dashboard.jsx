import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('adminToken')

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const res = await axios.get(`${API}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(res.data.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken')
        navigate('/admin/login')
      } else {
        setError(err.response?.data?.error || 'Failed to load dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-gray-900">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">
              {localStorage.getItem('adminEmail')}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid (Added Total Revenue) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data?.totalBookings || 0}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-amber-600">Pending</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{data?.pending || 0}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-green-600">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{data?.approved || 0}</p>
          </div>
          <div className="bg-primary-50 rounded-2xl p-5 shadow-sm border border-primary-100">
            <p className="text-sm text-primary-600">Total Revenue</p>
            <p className="text-3xl font-bold text-primary-600 mt-1">Rs. {data?.totalRevenue || 0}</p>
          </div>
        </div>

        {/* Navigation Cards (Added Walk-in, Payments, Contact) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/admin/bookings"
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl p-5 flex items-center justify-between transition"
          >
            <div>
              <p className="font-semibold">Manage Bookings</p>
              <p className="text-sm text-primary-100 mt-0.5">Approve / Reject</p>
            </div>
            <span className="text-2xl">→</span>
          </Link>
          
          <Link
            to="/admin/walk-in"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-5 flex items-center justify-between transition"
          >
            <div>
              <p className="font-semibold">Walk-in Entry</p>
              <p className="text-sm text-indigo-100 mt-0.5">Add Cash Booking</p>
            </div>
            <span className="text-2xl">+</span>
          </Link>

          <Link
            to="/admin/payments"
            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl p-5 flex items-center justify-between transition"
          >
            <div>
              <p className="font-semibold">Payments</p>
              <p className="text-sm text-green-100 mt-0.5">View Transactions</p>
            </div>
            <span className="text-2xl">₹</span>
          </Link>

          <Link
            to="/admin/contact"
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl p-5 flex items-center justify-between transition"
          >
            <div>
              <p className="font-semibold">Messages</p>
              <p className="text-sm text-orange-100 mt-0.5">Contact Queries</p>
            </div>
            <span className="text-2xl">✉</span>
          </Link>

          <Link
            to="/admin/bookings?status=pending"
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl p-5 flex items-center justify-between transition"
          >
            <div>
              <p className="font-semibold">Pending Only</p>
              <p className="text-sm text-amber-100 mt-0.5">{data?.pending || 0} waiting</p>
            </div>
            <span className="text-2xl">⏳</span>
          </Link>
          
          <Link
            to="/"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl p-5 flex items-center justify-between transition"
          >
            <div>
              <p className="font-semibold">Customer Site</p>
              <p className="text-sm text-gray-500 mt-0.5">Open booking page</p>
            </div>
            <span className="text-2xl">🌐</span>
          </Link>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-primary-600 font-medium">
              View all
            </Link>
          </div>

          {data?.recentBookings?.length === 0 ? (
            <p className="p-8 text-center text-gray-400">No bookings yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {data?.recentBookings?.map((b) => (
                <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{b.customerName}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {b.courtName} · {b.date} · {b.slotStart}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>
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
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}