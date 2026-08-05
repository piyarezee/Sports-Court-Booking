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
        // Ensure response is an array, if not, fallback to mock
        const data = Array.isArray(response) ? response : (response?.data || [])
        
        // Filter out any courts that don't have a valid ID
        const validCourts = data.filter(c => c && c.id != null)
        
        if (validCourts.length > 0) {
          setCourts(validCourts)
        } else {
          setCourts(mockCourts.filter(c => c && c.id != null))
        }
      } catch {
        setCourts(mockCourts.filter(c => c && c.id != null))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Wrapper to lock width on desktop */}
      <div className="w-full max-w-lg bg-gray-50 shadow-xl min-h-screen relative">
        
        {/* Top Branded Header */}
        <header className="bg-primary-600 text-white p-5 sticky top-0 z-10 shadow-lg rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight leading-tight">PLAYZONE SPORTS</h1>
              <p className="text-primary-100 text-sm font-medium">COMPLEX</p>
            </div>
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 pb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
            Book Your Court
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-gray-200 h-52 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {courts.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No courts available at the moment.</p>
              ) : (
                courts.map(court => (
                  <Link 
                    to={`/court/${String(court.id)}`} 
                    key={court.id}
                    className="block bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Court Image Container */}
                    <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                      <img 
                        src={court.image} 
                        alt={court.name} 
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient Overlay for better text visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary-700 shadow-sm">
                        Rs. {court.pricePerHour}/hr
                      </div>
                    </div>
                    
                    {/* Court Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg text-gray-900">{court.name}</h3>
                        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-semibold border border-primary-100">
                          {court.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {court.location}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {court.amenities?.slice(0, 3).map(item => (
                          <span key={item} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
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
        </main>
      </div>
    </div>
  )
}
