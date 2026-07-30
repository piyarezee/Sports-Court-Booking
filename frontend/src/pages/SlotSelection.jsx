import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import Header from '../components/Header'
import { courts, generateSlots } from '../data/mockData'

export default function SlotSelection() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const date = searchParams.get('date')

  const court = courts.find(c => c.id === id)
  const slots = useMemo(() => generateSlots(date || ''), [date])

  const [selectedSlot, setSelectedSlot] = useState(null)

  if (!court || !date) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invalid selection</p>
      </div>
    )
  }

  const formattedDate = new Date(date).toLocaleDateString('en-PK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const handleContinue = () => {
    if (!selectedSlot) return
    navigate(`/book?court=${id}&date=${date}&slot=${selectedSlot.start}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header 
        title="Select Time Slot" 
        showBack 
        backTo={`/court/${id}`} 
      />

      <main className="max-w-lg mx-auto px-4 pt-5">
        {/* Summary */}
        <div className="card mb-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-gray-900">{court.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{formattedDate}</p>
            </div>
            <div className="text-right">
              <p className="text-primary-600 font-bold">Rs. {court.pricePerHour}</p>
              <p className="text-xs text-gray-400">per hour</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary-500"></span>
            Available
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-300"></span>
            Booked
          </div>
        </div>

        {/* Slots Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {slots.map(slot => {
            const isSelected = selectedSlot?.id === slot.id
            const isDisabled = slot.isBooked

            return (
              <button
                key={slot.id}
                disabled={isDisabled}
                onClick={() => setSelectedSlot(slot)}
                className={`
                  py-3 px-2 rounded-xl text-sm font-medium transition-all
                  ${isDisabled 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' 
                    : isSelected
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-400'
                  }
                `}
              >
                {slot.label}
              </button>
            )
          })}
        </div>
      </main>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-lg mx-auto">
          {selectedSlot && (
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-gray-500">Selected</span>
              <span className="font-medium text-gray-900">
                {selectedSlot.label} · Rs. {court.pricePerHour}
              </span>
            </div>
          )}
          <button
            onClick={handleContinue}
            disabled={!selectedSlot}
            className={`
              w-full btn-primary
              ${!selectedSlot ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {selectedSlot ? 'Continue to Booking' : 'Select a Slot'}
          </button>
        </div>
      </div>
    </div>
  )
}
