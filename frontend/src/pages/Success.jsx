import { useLocation, Link } from 'react-router-dom'

export default function Success() {
  const { state } = useLocation()

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-gray-500 mb-4">No booking data found</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Booking Submitted!
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Your booking is pending admin approval.<br />
          You will receive a confirmation email shortly.
        </p>

        {/* Details Card */}
        <div className="card w-full mb-8">
          <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
            Booking Details
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-900">{state.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mobile</span>
              <span className="font-medium text-gray-900">{state.mobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Court</span>
              <span className="font-medium text-gray-900">{state.courtName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">{state.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span className="font-medium text-gray-900">{state.slot}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-500 font-medium">Amount</span>
              <span className="font-bold text-primary-600">Rs. {state.amount}</span>
            </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <Link to="/" className="block w-full btn-primary text-center">
            Book Another Court
          </Link>
          <p className="text-center text-xs text-gray-400">
            Status: <span className="text-amber-600 font-medium">Pending Approval</span>
          </p>
        </div>
      </main>
    </div>
  )
}
