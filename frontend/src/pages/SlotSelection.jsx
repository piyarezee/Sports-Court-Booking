import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '../components/Header'

const API = import.meta.env.VITE_API_URL || '/api'

export default function SlotSelection() {
  const { id } = useParams();
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const courtId = id;
  const date = searchParams.get('date')

  const [court, setCourt] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [duration, setDuration] = useState(1) // Default 1 hour
  const [selectedStart, setSelectedStart] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
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

  const handleSlotClick = (startSlot) => {
    setError('')
    const startIndex = slots.findIndex(s => s.start === startSlot)
    
    // Check if selected duration slots are available
    for (let i = 0; i < duration; i++) {
      if (startIndex + i >= slots.length) {
        setError('Cannot book this duration, court closes soon.')
        return
      }
      if (slots[startIndex + i].isBooked) {
        setError(`Slot ${slots[startIndex + i].start} is already booked.`)
        return
      }
    }
    
    setSelectedStart(startSlot)
  }

  const handleContinue = () => {
    if (!selectedStart) return
    
    const startIndex = slots.findIndex(s => s.start === selectedStart)
    const endSlotObj = slots[startIndex + duration - 1]
    const endTime = endSlotObj.end // e.g., "14:00"
    
    navigate(`/book?court=${courtId}&date=${date}&slotStart=${selectedStart}&slotEnd=${endTime}&duration=${duration}`)
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

          {/* Duration Selector */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Select Duration</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(h => (
                <button
                  key={h}
                  onClick={() => { setDuration(h); setSelectedStart(null); setError('') }}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${
                    duration === h 
                      ? 'bg-primary-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {h} Hour{h > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
            Available Time Slots
          </h3>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm">Fetching available slots...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {slots.length === 0 ? (
                <p className="text-center text-gray-500 col-span-3 py-6">No slots available for this date.</p>
              ) : (
                slots.map(slot => {
                  const isBooked = slot.isBooked
                  const isSelected = selectedStart === slot.start

                  return (
                    <button
                      key={slot.id}
                      onClick={() => !isBooked && handleSlotClick(slot.start)}
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
                })
              )}
            </div>
          )}
        </main>

        {/* Sticky Bottom Button */}
        {!loading && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
            <div className="max-w-lg mx-auto">
              <button
                onClick={handleContinue}
                disabled={!selectedStart}
                className={`w-full btn-primary text-center ${!selectedStart ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {selectedStart ? `Proceed to Book (${duration} Hr)` : 'Select a Start Time'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
