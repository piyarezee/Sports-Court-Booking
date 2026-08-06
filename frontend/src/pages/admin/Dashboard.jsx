import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function StaffDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('staffToken')
  const [bookings, setBookings] = useState([])
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState('')
  const scannerRef = useRef(null)

  // 1. Fetch Bookings Only Once on Mount
  useEffect(() => {
    if (!token) {
      navigate('/staff/login')
      return
    }
    
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API}/admin/staff/today-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBookings(res.data.data)
      } catch (err) {
        setError('Failed to load approved bookings')
      }
    }
    fetchBookings()
  }, [token, navigate])

  // 2. QR Scanner Logic
  useEffect(() => {
    if (scanResult) return // Stop scanner if result is shown

    const scanner = new Html5Qrcode("qr-reader")
    scannerRef.current = scanner

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        const cleanText = decodedText.trim();
        const foundBooking = bookings.find(b => b.id === cleanText)
        
        if (foundBooking) {
          setScanResult({ status: 'success', booking: foundBooking })
        } else {
          setScanResult({ status: 'error', message: `Invalid or Pending QR: ${cleanText}` })
        }
        scanner.stop().catch(() => {})
      },
      (err) => { /* Ignore */ }
    ).catch(err => {
      setError("Failed to start camera. Please check permissions.")
    })

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [scanResult]) // Removed 'bookings' from dependency array to prevent re-init

  const handleLogout = () => {
    localStorage.removeItem('staffToken')
    navigate('/staff/login')
  }

  const rescan = () => {
    setScanResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-black/30 border-b border-gray-800 p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Staff Check-in</h1>
        <button onClick={handleLogout} className="text-sm text-red-400 font-medium">Logout</button>
      </header>

      <main className="max-w-md mx-auto p-4">
        {error && <p className="text-red-400 text-center mb-4 bg-red-900/20 p-2 rounded">{error}</p>}

        {!scanResult && (
          <div className="bg-white rounded-2xl p-4 mb-6 overflow-hidden">
            <div id="qr-reader" className="w-full rounded-xl overflow-hidden"></div>
            <p className="text-center text-gray-500 text-sm mt-2">Point camera at the QR code</p>
          </div>
        )}

        {scanResult && (
          <div className="bg-white text-gray-900 rounded-2xl p-6 mb-6 text-center">
            {scanResult.status === 'success' ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-xl font-bold text-green-600 mb-2">Check-in Successful!</h2>
                <p className="font-medium text-lg">{scanResult.booking.customerName}</p>
                <p className="text-gray-500 text-sm">{scanResult.booking.courtName}</p>
                <p className="text-gray-500 text-sm">Time: {scanResult.booking.slotStart} - {scanResult.booking.slotEnd}</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <h2 className="text-xl font-bold text-red-600 mb-2">Check-in Failed!</h2>
                <p className="text-gray-500 text-sm">{scanResult.message}</p>
              </>
            )}
            <button onClick={rescan} className="btn-primary w-full mt-6">Scan Next</button>
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="font-semibold mb-3 text-gray-300">Approved Bookings ({bookings.length})</h3>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No bookings approved yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {bookings.map(b => (
                <div key={b.id} className="bg-gray-700/50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{b.customerName}</p>
                    <p className="text-xs text-gray-400">{b.courtName} · {b.slotStart}</p>
                  </div>
                  <span className="text-xs bg-primary-600/20 text-primary-400 px-2 py-1 rounded">{b.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
