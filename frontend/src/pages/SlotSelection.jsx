import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '../components/Header'

const API = import.meta.env.VITE_API_URL || '/api'

export default function SlotSelection() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const courtId = searchParams.get('court')
  const date = searchParams.get('date')

  const [court, setCourt] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Direct backend se is court aur date ki slots mangwaya (Timeout hata diya)
        const response = await axios.get(`${API}/courts/${courtId}/slots?date=${date}`)
        if (response.data?.data) {
          setCourt(response.data.data.court)
          setSlots(response.data.data.slots)
        }
      } catch (err) {
        console.error('Failed to load slots:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (courtId && date) loadData()
  }, [courtId, date])

  const handleContinue = () => {
    if (!selectedSlot) return
    navigate(`/book?court=${courtId}&date=${date}&slot=${selectedSlot}`)
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
            <h2 className="text-lg font-bold">{court?.name || 'Loading Court...'}</h2>
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

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm">Waking up server & fetching slots...</p>
            </div>
          ) : (
            /* Slots Grid - Backend se aayi hui real slots */
            <div className="grid grid-cols-3 gap-3">
              {slots.map(slot => {
                const isBooked = slot.isBooked
                const isSelected = selectedSlot === slot.start

                return (
                  <button
                    key={slot.id}
                    onClick={() => !isBooked && setSelectedSlot(slot.start)}
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
                    {slot.start}
                  </button>
                )
              })}
            </div>
          )}
        </main>

        {/* Sticky Bottom Button */}
        {!loading && (
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
        )}
      </div>
    </div>
  )
}
