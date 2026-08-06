import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCourts } from '../services/api'
import { courts as mockCourts } from '../data/mockData'

export default function Home() {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)

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
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full filter blur-[120px]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full filter blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-6 pb-10">
        <header className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 sticky top-4 z-20 rounded-2xl shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight leading-tight text-white">Athletic Center SAC</h1>
              <p className="text-primary-300 text-sm font-medium">DHA | MAIN</p>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
              <svg className="w-6 h-6 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
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
