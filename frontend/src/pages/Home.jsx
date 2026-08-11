import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCourts } from '../services/api'
import { courts as mockCourts } from '../data/mockData'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function Home() {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notifs, setNotifs] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)

  const userMobile = localStorage.getItem('userMobile') || 'unknown'

  useEffect(() => {
    async function load() {
      try {
        const response = await getCourts()
        const data = Array.isArray(response) ? response : (response?.data || [])
        const validCourts = data.filter(c => c && c.id != null)
        if (validCourts.length > 0) setCourts(validCourts)
        else setCourts(mockCourts.filter(c => c && c.id != null))
      } catch {
        setCourts(mockCourts.filter(c => c && c.id != null))
      } finally {
        setLoading(false)
      }
    }
    load()

    const fetchNotifs = async () => {
      try {
        const res = await axios.get(`${API}/notifications/${userMobile}`)
        if (res.data?.success) setNotifs(res.data.data)
      } catch (e) {}
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)

  }, [userMobile])

  const unreadCount = notifs.length

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full filter blur-[120px]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full filter blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-6 pb-10">
        
        <header className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 sticky top-4 z-20 rounded-2xl shadow-lg mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight text-white">Athletic Center SAC</h1>
            <p className="text-primary-300 text-sm font-medium">DHA | MAIN</p>
          </div>
          
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10 relative">
              <svg className="w-6 h-6 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-white/10 font-semibold text-sm">Notifications</div>
                <div className="max-h-60 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <p className="p-4 text-center text-slate-500 text-sm">No new notifications</p>
                  ) : (
                    notifs.map((n, i) => (
                      <div key={i} className="p-3 border-b border-white/5 hover:bg-white/5">
                        <p className="font-semibold text-sm text-white">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{new Date(n.date).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary-500 rounded-full"></span>
          Book Your Court
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 h-60 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {courts.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-slate-400">No courts available at the moment.</p>
              </div>
            ) : (
              courts.map(court => (
                <Link 
                  to={`/court/${String(court.id)}`} 
                  key={court.id}
                  className="block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-hidden hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                    <img src={court.image} alt={court.name} className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-primary-300 border border-white/10">
                      Rs. {court.pricePerHour}/hr
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-white">{court.name}</h3>
                      <span className="text-xs bg-primary-500/20 text-primary-300 px-2 py-1 rounded-full font-semibold border border-primary-500/30">
                        {court.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 flex items-center gap-1 mb-3">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {court.location}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {court.amenities?.slice(0, 3).map(item => (
                        <span key={item} className="text-[10px] bg-white/5 text-slate-300 px-2 py-1 rounded-md font-medium border border-white/10">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
