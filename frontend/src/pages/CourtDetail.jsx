import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header'
import { courts } from '../data/mockData'

export default function CourtDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const court = courts.find(c => c.id === id)

  // Generate next 14 days
  const today = new Date()
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  const [selectedDate, setSelectedDate] = useState(null)

  if (!court) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Court not found</p>
      </div>
    )
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const formatDateValue = (date) => {
    return date.toISOString().split('T')[0]
  }

  const handleContinue = () => {
    if (!selectedDate) return
    navigate(`/court/${id}/slots?date=${selectedDate}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title={court.name} showBack backTo="/" />

      {/* Court Image */}
      <div className="relative h-48">
        <img 
          src={court.image} 
          alt={court.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium">
            {court.type}
          </span>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 -mt-4 relative z-10">
        <div className="card mb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{court.name}</h2>
          <p className="text-sm text-gray-500 mb-3">{court.location}</p>
          <p className="text-sm text-gray-600 mb-4">{court.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {court.amenities.map(item => (
              <span key={item} className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {item}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-gray-500 text-sm">Price per hour</span>
            <span className="text-primary-600 font-bold text-xl">
              Rs. {court.pricePerHour}
            </span>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Select Date</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {dates.map((date) => {
              const value = formatDateValue(date)
              const isSelected = selectedDate === value
              const isToday = value === formatDateValue(today)

              return (
                <button
                  key={value}
                  onClick={() => setSelectedDate(value)}
                  className={`
                    flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all
                    ${isSelected 
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-200' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                    }
                  `}
                >
                  <div className="text-[10px] uppercase opacity-70">
                    {isToday ? 'Today' : date.toLocaleDateString('en-PK', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-bold leading-tight">
                    {date.getDate()}
                  </div>
                  <div className="text-[10px] opacity-70">
                    {date.toLocaleDateString('en-PK', { month: 'short' })}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            disabled={!selectedDate}
            className={`
              w-full btn-primary text-center
              ${!selectedDate ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {selectedDate ? 'View Available Slots' : 'Select a Date'}
          </button>
        </div>
      </div>
    </div>
  )
}
