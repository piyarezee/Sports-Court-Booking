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

  const handleDownloadQR = () => {
    if (state.qrCode) {
      const link = document.createElement('a');
      link.href = state.qrCode;
      link.download = `QR-Code-${state.bookingId}.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          Booking Submitted!
        </h1>
        {/* WhatsApp Message */}
        <p className="text-slate-400 text-center mb-8">
          Your booking is pending admin approval.<br />
          You will receive a confirmation via <span className="text-green-400 font-medium">WhatsApp</span> shortly.
        </p>

        {/* Details Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg w-full mb-8 p-5">
          <h3 className="font-semibold text-white mb-3 border-b border-white/10 pb-2">
            Booking Details
          </h3>
          <div className="space-y-2.5 text-sm">
            {state.bookingId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Booking ID</span>
                <span className="font-medium text-white">{state.bookingId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Name</span>
              <span className="font-medium text-white">{state.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mobile</span>
              <span className="font-medium text-white">{state.mobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Court</span>
              <span className="font-medium text-white">{state.courtName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date</span>
              <span className="font-medium text-white">{state.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Time</span>
              <span className="font-medium text-white">{state.slot}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-slate-400 font-medium">Amount</span>
              <span className="font-bold text-primary-400">Rs. {state.amount}</span>
            </div>
          </div>
        </div>

        {/* QR Code Section with Download Button */}
        {state.qrCode && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg w-full mb-8 p-5 text-center">
            <h3 className="font-semibold text-white mb-3 border-b border-white/10 pb-2">
              Check-in QR Code
            </h3>
            <p className="text-slate-400 text-xs mb-4">Save this QR code. You will need to show it at the court.</p>
            <img src={state.qrCode} alt="Booking QR Code" className="mx-auto w-48 h-48 rounded-lg border border-white/10 p-2 bg-white" />
            <button 
              onClick={handleDownloadQR} 
              className="mt-4 w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download QR Code
            </button>
          </div>
        )}

        <div className="w-full space-y-3">
          <Link to="/" className="block w-full bg-white/10 border border-white/10 hover:bg-white/20 text-white text-center py-4 rounded-xl font-bold text-sm transition backdrop-blur-md">
            Book Another Court
          </Link>
          <p className="text-center text-xs text-slate-500">
            Status: <span className="text-amber-400 font-medium">Pending Approval</span>
          </p>
        </div>
      </main>
    </div>
  )
}
