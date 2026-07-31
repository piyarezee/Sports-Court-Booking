import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { getCourt, getBookingsByDate } from '../services/api'
import { courts as mockCourts } from '../data/mockData'

export default function SlotSelection() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const courtId = searchParams.get('court')
  const date = searchParams.get('date')

  const [court, setCourt] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const courtData = await getCourt(courtId)
        setCourt(courtData)
        
        const bookingsData = await getBookingsByDate(courtId, date)
        setBookedSlots(bookingsData.map(b => b.slotStart))
      } catch {
        setCourt(mockCourts.find(c => c.id === courtId) || null)
      } finally {
        setLoading(false)
      }
    }
    if (courtId && date) loadData()
  }, [courtId, date])

  // Generate slots from 10:00 to 22:00
  const allSlots = Array.from({ length: 13 }, (_, i) => `${String(i + 10).padStart(2, '0')}:00`)

  const handleContinue = () => {
    if (!selectedSlot) return
    navigate(`/book?court=${courtId}&date=${date}&slot=${selectedSlot}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading slots...</p>
      </div>
    )
  }

  if (!court) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Court not found</p>
      </div>
    )
  }

  const formattedDate = new Date(date).toLocaleDateString('en-PK', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-lg bg-gray-50 shadow-xl min-h-screen relative pb-28">
        <Header title="Select Slot" showBack backTo={`/court/${courtId}`} />

        <main className="px-4 py-5">
          {/* Date & Court Info */}
          <div className="bg-primary-600 text-white p-4 rounded-2xl mb-6 shadow-md">
            <h2 className="text-lg font-bold">{court.name}</h2>
            <p className="text-primary-100 text-sm flex items-center gap-1.5 mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate}
            </p>
          </div>

          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
            Available Time Slots
          </h3>

          {/* Slots Grid */}
          <div className="grid grid-cols-3 gap-3">
            {allSlots.map(slot => {
              const isBooked = bookedSlots.includes(slot)
              const isSelected = selectedSlot === slot

              return (
                <button
                  key={slot}
                  onClick={() => !isBooked && setSelectedSlot(slot)}
                  disabled={isBooked}
                  className={`py-3 rounded-xl text-center text-sm font-semibold transition-all duration-200
                    ${isBooked 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' 
                      : isSelected 
                        ? 'bg-primary-600 text-white shadow-md scale-105' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                    }`
                  }
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </main>

        {/* Sticky Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleContinue}
              disabled={!selectedSlot}
              className={`w-full btn-primary text-center ${!selectedSlot ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {selectedSlot ? `Proceed to Book (${selectedSlot})` : 'Select a Time Slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}