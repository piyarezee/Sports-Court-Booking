import { Link } from 'react-router-dom'

export default function Header({ title = 'Sports Court', showBack = false, backTo = '/' }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        {showBack && (
          <Link 
            to={backTo} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {title}
        </h1>
      </div>
    </header>
  )
}
