import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { getCourt } from '../services/api'
import { courts as mockCourts } from '../data/mockData'

export default function CourtDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [court, setCourt] = useState(null)
  const [activeMedia, setActiveMedia] = useState(null)

  useEffect(() => {
    async function loadCourt() {
      try {
        const data = await getCourt(id)
        setCourt(data)
      } catch (err) {
        const mock = mockCourts.find(c => c.id === id)
        setCourt(mock)
      }
    }
    loadCourt()
  }, [id])

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

  const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const youtubeId = getYouTubeID(court.youtubeUrl);
  const galleryImages = court.gallery ? court.gallery.split(',').map(url => url.trim()).filter(url => url) : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-lg mx-auto bg-gray-50 min-h-screen shadow-sm">
        <Header title={court.name} showBack backTo="/" />

        {/* Court Main Image */}
        <div className="relative h-60 w-full bg-gray-100 overflow-hidden">
          <img 
            src={court.image} 
            alt={court.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <span className="bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
              {court.type}
            </span>
          </div>
        </div>

        <main className="px-4 py-5 relative z-10">
          {/* Main Info Card */}
          <div className="card mb-5">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{court.name}</h2>
            <p className="text-sm text-gray-500 mb-3">{court.location}</p>
            <p className="text-sm text-gray-600 mb-4">{court.description}</p>

            {/* Amenities */}
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

            {/* Media Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {youtubeId && (
                <button onClick={() => setActiveMedia('video')} className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium px-2 py-3 rounded-xl hover:bg-gray-100 transition">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  Video
                </button>
              )}
              {galleryImages.length > 0 && (
                <button onClick={() => setActiveMedia('gallery')} className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium px-2 py-3 rounded-xl hover:bg-gray-100 transition">
                  <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Photos
                </button>
              )}
              {court.mapUrl && (
                <button onClick={() => setActiveMedia('map')} className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium px-2 py-3 rounded-xl hover:bg-gray-100 transition">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Map
                </button>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500 text-sm">Price per hour</span>
              <span className="text-primary-600 font-bold text-xl">Rs. {court.pricePerHour}</span>
            </div>
          </div>

          {/* Date Selection - Grid Layout (7 days per row) */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Select Date</h3>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pb-2">
              {dates.map((date) => {
                const value = formatDateValue(date)
                const isSelected = selectedDate === value
                const isToday = value === formatDateValue(today)

                return (
                  <button
                    key={value}
                    onClick={() => setSelectedDate(value)}
                    className={`py-2 rounded-lg text-center transition-all flex flex-col items-center justify-center
                      ${isSelected 
                        ? 'bg-primary-600 text-white shadow-md' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                      }`
                    }
                  >
                    <div className="text-[9px] sm:text-[10px] uppercase opacity-70">
                      {isToday ? 'Today' : date.toLocaleDateString('en-PK', { weekday: 'short' })}
                    </div>
                    <div className="text-sm sm:text-lg font-bold leading-tight">
                      {date.getDate()}
                    </div>
                    <div className="text-[9px] sm:text-[10px] opacity-70 hidden sm:block">
                      {date.toLocaleDateString('en-PK', { month: 'short' })}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            disabled={!selectedDate}
            className={`w-full btn-primary text-center ${!selectedDate ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {selectedDate ? 'View Available Slots' : 'Select a Date'}
          </button>
        </div>
      </div>

      {/* Media Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4">
          <div className="flex justify-end mb-4">
            <button onClick={() => setActiveMedia(null)} className="text-white text-3xl leading-none p-2">&times;</button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto">
            {activeMedia === 'video' && (
              <div className="w-full max-w-2xl aspect-video">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            {activeMedia === 'gallery' && (
              <div className="w-full max-w-md space-y-4">
                {galleryImages.map((imgUrl, index) => (
                  <img key={index} src={imgUrl} alt={`Gallery ${index + 1}`} className="w-full rounded-lg" />
                ))}
              </div>
            )}
            {activeMedia === 'map' && (
              <div className="w-full h-full max-w-2xl">
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}