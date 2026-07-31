import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { getCourt } from '../services/api'
import { courts as mockCourts } from '../data/mockData'

export default function CourtDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [court, setCourt] = useState(null)

  useEffect(() => {
    async function loadCourt() {
      try {
        const data = await getCourt(id)
        setCourt(data)
      } catch (err) {
        // Fallback to mock data if API fails
        const mock = mockCourts.find(c => c.id === id)
        setCourt(mock)
      }
    }
    loadCourt()
  }, [id])

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
        <p className="text-gray-500">Loading court details...</p>
      </div>
    )
  }

  const formatDateValue = (date) => {
    return date.toISOString().split('T')[0]
  }

  const handleContinue = () => {
    if (!selectedDate) return
    navigate(`/court/${id}/slots?date=${selectedDate}`)
  }

  // Extract YouTube Video ID
  const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const youtubeId = getYouTubeID(court.youtubeUrl);

  // Parse gallery images (comma separated URLs)
  const galleryImages = court.gallery ? court.gallery.split(',').map(url => url.trim()).filter(url => url) : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title={court.name} showBack backTo="/" />

      {/* Court Main Image */}
      <div className="relative h-56">
        <img 
          src={court.image} 
          alt={court.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium">
            {court.type}
          </span>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 -mt-6 relative z-10">
        {/* Main Info Card */}
        <div className="card mb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{court.name}</h2>
          <p className="text-sm text-gray-500 mb-3">{court.location}</p>
          <p className="text-sm text-gray-600 mb-4">{court.description}</p>

          {/* Amenities / Facilities */}
          {court.amenities && court.amenities.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Facilities</h4>
              <div className="flex flex-wrap gap-2">
                {court.amenities.map(item => (
                  <span key={item} className="flex items-center gap-1 bg-gray-50 text-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-full border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-gray-500 text-sm">Price per hour</span>
            <span className="text-primary-600 font-bold text-xl">Rs. {court.pricePerHour}</span>
          </div>
        </div>

        {/* YouTube Video Section */}
        {youtubeId && (
          <div className="card mb-5 overflow-hidden p-0">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Court Video</h3>
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Image Gallery Section */}
        {galleryImages.length > 0 && (
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900 mb-3">Gallery</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {galleryImages.map((imgUrl, index) => (
                <img 
                  key={index} 
                  src={imgUrl} 
                  alt={`Gallery ${index + 1}`} 
                  className="flex-shrink-0 w-40 h-28 object-cover rounded-xl border border-gray-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Google Map Section */}
        {court.mapUrl && (
          <div className="card mb-5 overflow-hidden p-0">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Location</h3>
            </div>
            <div className="w-full h-48 bg-gray-100">
              <iframe
                title="Court Location"
                src={court.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        )}

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