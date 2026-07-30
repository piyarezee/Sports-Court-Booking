import { useState, useEffect } from 'react'
import Header from '../components/Header'
import CourtCard from '../components/CourtCard'
import { getCourts } from '../services/api'
import { courts as mockCourts } from '../data/mockData'

export default function Home() {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourts()
        setCourts(data)
      } catch (err) {
        console.warn('API failed, using mock data:', err.message)
        setCourts(mockCourts.filter(c => c.isActive))
        setError('Using demo data (backend not connected yet)')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header title="Sports Court Booking" />

      <main className="max-w-lg mx-auto px-4 pt-5">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Book Your Court
          </h2>
          <p className="text-gray-500 text-sm">
            Select a court to view available slots
          </p>
          {error && (
            <p className="text-amber-600 text-xs mt-2 bg-amber-50 px-3 py-1.5 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-40 bg-gray-200 rounded-xl -mx-4 -mt-4 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {courts.map(court => (
              <CourtCard key={court.id} court={court} />
            ))}
            {courts.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p>No courts available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
