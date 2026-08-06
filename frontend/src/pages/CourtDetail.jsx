import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Loading court details...</p>
      </div>
    )
  }

  const formatDateValue = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - tzOffset).toISOString().split('T')[0]
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

  return (
    <div className="min-h-screen bg-slate-900 pb-28 text-white">
      <div className="max-w-lg mx-auto relative">
        <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
          <button onClick={() => navigate('/')} className="p-2 bg-black/30 backdrop-blur-md rounded-full border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="font-bold text-sm bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 truncate max-w-[60%]">{court.name}</h1>
          <div className="w-9"></div>
        </div>

        <div className="relative h-80 w-full bg-slate-800 overflow-hidden">
          <img src={court.image} alt={court.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        </div>

        <main className="px-4 -mt-10 relative z-10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl mb-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{court.name}</h2>
                <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                  <svg className="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {court.location}
                </p>
              </div>
              <span className="bg-primary-500/20 text-primary-300 text-xs font-medium px-2.5 py-1 rounded-full border border-primary-500/30">{court.type}</span>
            </div>
            
            <p className="text-sm text-slate-300 mb-5 leading-relaxed">{court.description}</p>

            {court.amenities && court.amenities.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Facilities</h4>
                <div className="flex flex-wrap gap-2">
                  {court.amenities.map(item => (
                    <span key={item} className="flex items-center gap-1 bg-white/5 text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-full border border-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 mb-5">
              {youtubeId && (
                <button onClick={() => setActiveMedia('video')} className="flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/10 text-white text-xs font-medium py-3 rounded-xl hover:bg-white/10 transition">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  Video
                </button>
              )}
              {court.gallery && (
                <a href={court.gallery} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/10 text-white text-xs font-medium py-3 rounded-xl hover:bg-white/10 transition">
                  <svg className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Photos
                </a>
              )}
              {court.mapUrl && (
                <button onClick={() => setActiveMedia('map')} className="flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/10 text-white text-xs font-medium py-3 rounded-xl hover:bg-white/10 transition">
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Map
                </button>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-slate-400 text-sm">Price per hour</span>
              <span className="text-primary-400 font-bold text-2xl">Rs. {court.pricePerHour}</span>
            </div>
          </div>

          {/* 14 Days Grid (7 columns x 2 rows) */}
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
              <span className="w-1.5 h-5 bg-primary-500 rounded-full"></span>
              Select Date (14 Days)
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {dates.map((date) => {
                const value = formatDateValue(date)
                const isSelected = selectedDate === value
                const isToday = value === formatDateValue(today)

                return (
                  <button
                    key={value}
                    onClick={() => setSelectedDate(value)}
                    className={`py-2 rounded-lg text-center transition-all duration-200 ${
                      isSelected 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105' 
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-[9px] uppercase opacity-80 font-bold">
                      {isToday ? 'Today' : date.toLocaleDateString('en-PK', { weekday: 'short' })}
                    </div>
                    <div className="text-base font-bold leading-tight mt-0.5">
                      {date.getDate()}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-white/10 p-4 z-30">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            disabled={!selectedDate}
            className={`w-full py-4 rounded-xl text-center font-bold text-sm transition-all duration-300 ${
              selectedDate 
                ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30' 
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            {selectedDate ? 'View Available Slots →' : 'Select a Date to Continue'}
          </button>
        </div>
      </div>

      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-4">
          <div className="flex justify-end mb-4">
            <button onClick={() => setActiveMedia(null)} className="text-white text-4xl leading-none p-2 bg-white/10 rounded-full w-12 h-12 flex items-center justify-center">&times;</button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto">
            {activeMedia === 'video' && (
              <div className="w-full max-w-2xl aspect-video">
                <iframe className="w-full h-full rounded-lg" src={`https://www.youtube.com/embed/${youtubeId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
            )}
            {activeMedia === 'map' && (
              <div className="w-full h-full max-w-2xl">
                <iframe title="Court Location" src={court.mapUrl} width="100%" height="100%" style={{ border: 0, borderRadius: '12px' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
