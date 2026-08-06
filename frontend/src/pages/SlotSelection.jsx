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
  const [bookedSlots, setBookedSlots] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [duration, setDuration] = useState(1)
  const [selectedStart, setSelectedStart] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const courtRes = await axios.get(`${API}/courts/${courtId}`)
        if (courtRes.data?.data) setCourt(courtRes.data.data)

        try {
          const response = await axios.get(`${API}/bookings`)
          const allBookings = response.data?.data || []
          const filteredBookings = allBookings.filter(b => String(b.courtId) === String(courtId) && b.date === date)
          setBookedSlots(filteredBookings.map(b => b.slotStart))
        } catch (err) { /* Blank slots */ }

      } catch (err) {
        console.error('Failed to load court:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (courtId && date) loadData()
  }, [courtId, date])

  const allSlots = Array.from({ length: 13 }, (_, i) => `${String(i + 10).padStart(2, '0')}:00`)

  const handleSlotClick = (startSlot) => {
    setError('')
    const startIndex = allSlots.indexOf(startSlot)
    
    for (let i = 0; i < duration; i++) {
      if (startIndex + i >= allSlots.length) {
        setError('Cannot book this duration, court closes soon.')
        return
      }
      const checkSlot = allSlots[startIndex + i]
      if (bookedSlots.includes(checkSlot)) {
        setError(`Slot ${checkSlot} is already booked.`)
        return
      }
    }
    setSelectedStart(startSlot)
  }

  const handleContinue = () => {
    if (!selectedStart) return
    const endTime = `${String(Number(selectedStart.split(':')[0]) + duration).padStart(2, '0')}:00`
    navigate(`/book?court=${courtId}&date=${date}&slotStart=${selectedStart}&slotEnd=${endTime}&duration=${duration}`)
  }

  const formattedDate = new Date(date).toLocaleDateString('en-PK', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full filter blur-[120px]"></div>
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-5 pb-28">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/court/${courtId}`)} className="p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="font-bold text-lg">Select Slot</h1>
        </div>

        <div className="bg-primary-500/10 backdrop-blur-xl border border-primary-500/30 text-white p-4 rounded-2xl mb-6 shadow-lg">
          <h2 className="text-lg font-bold">{court?.name || 'Loading Court...'}</h2>
          <p className="text-primary-200 text-sm flex items-center gap-1.5 mt-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {formattedDate}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-lg mb-6">
          <h3 className="font-semibold text-white mb-3 text-sm">Select Duration</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(h => (
              <button
                key={h}
                onClick={() => { setDuration(h); setSelectedStart(null); setError('') }}
                className={`py-2 rounded-xl text-sm font-bold transition-all ${
                  duration === h 
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {h} Hour{h > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>

        <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
          <span className="w-1.5 h-5 bg-primary-500 rounded-full"></span>
          Available Time Slots
        </h3>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-4 text-sm font-medium text-center backdrop-blur-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
            <p className="text-slate-400 mt-3 text-sm">Fetching available slots...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {allSlots.map(slot => {
              const isBooked = bookedSlots.includes(slot)
              const isSelected = selectedStart === slot

              return (
                <button
                  key={slot}
                  onClick={() => !isBooked && handleSlotClick(slot)}
                  disabled={isBooked}
                  className={`py-3 rounded-xl text-center text-sm font-semibold transition-all duration-200 backdrop-blur-md ${
                    isBooked 
                      ? 'bg-white/5 text-slate-600 cursor-not-allowed line-through' 
                      : isSelected 
                        ? 'bg-primary-500 text-white shadow-lg scale-105' 
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`
                  }
                >
                  {slot}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-white/10 p-4 z-30">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleContinue}
              disabled={!selectedStart}
              className={`w-full py-4 rounded-xl text-center font-bold text-sm transition-all duration-300 ${
                selectedStart 
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30' 
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              {selectedStart ? `Proceed to Book (${duration} Hr) →` : 'Select a Start Time'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
