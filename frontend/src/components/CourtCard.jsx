import { Link } from 'react-router-dom'

export default function CourtCard({ court }) {
  return (
    <Link 
      to={`/court/${court.id}`}
      className="block card overflow-hidden active:scale-[0.98] transition-transform duration-150"
    >
      <div className="relative h-40 -mx-4 -mt-4 mb-3">
        <img 
          src={court.image} 
          alt={court.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-800">
          {court.type}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
          {court.name}
        </h3>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {court.location}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-primary-600 font-bold text-lg">
            Rs. {court.pricePerHour}
            <span className="text-sm font-normal text-gray-500">/hr</span>
          </span>
          <span className="text-sm text-primary-600 font-medium">
            Book Now →
          </span>
        </div>
      </div>
    </Link>
  )
}
