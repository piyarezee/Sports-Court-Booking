import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function SystemStatus() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStatus() {
      try {
        const token = localStorage.getItem('adminToken')
        const res = await axios.get(`${API}/admin/system-status`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStatus(res.data.data)
      } catch (err) {
        console.error('Failed to load status')
      } finally {
        setLoading(false)
      }
    }
    loadStatus()
  }, [])

  const StatusCard = ({ title, statusData, icon }) => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400">{statusData?.message}</p>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
        statusData?.status === 'Operational' || statusData?.status === 'Configured'
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
          : 'bg-red-500/10 text-red-400 border-red-500/30'
      }`}>
        {statusData?.status}
      </div>
    </div>
  )

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Status...</div>

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full filter blur-[120px]"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-xl font-bold">Reporting & Monitoring</h1>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Total Bookings</p>
            <p className="text-2xl font-bold text-white">{status?.totalBookings || 0}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
            <p className="text-xs text-amber-400 mb-1">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-400">{status?.pendingApprovals || 0}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
            <p className="text-xs text-emerald-400 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-400">Rs. {status?.totalRevenue || 0}</p>
          </div>
        </div>

        {/* System Health */}
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">System Health</h2>
        <div className="space-y-3 mb-8">
          <StatusCard title="Backend API" statusData={status?.backend} icon="⚙️" />
          <StatusCard title="Google Sheets Database" statusData={status?.googleSheets} icon="📊" />
          <StatusCard title="Google Drive Storage" statusData={status?.googleDrive} icon="📁" />
          <StatusCard title="WhatsApp Notifications" statusData={status?.whatsapp} icon="💬" />
          <StatusCard title="Email Service" statusData={status?.emailService} icon="✉️" />
        </div>

        {/* Test Links */}
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">System Test Page</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/" className="bg-primary-500/10 border border-primary-500/30 text-primary-300 text-center py-3 rounded-xl font-semibold text-sm hover:bg-primary-500/20 transition">
            Test Customer Site
          </Link>
          <Link to="/staff/login" className="bg-white/5 border border-white/10 text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition">
            Test Staff Scanner
          </Link>
        </div>
      </div>
    </div>
  )
}
