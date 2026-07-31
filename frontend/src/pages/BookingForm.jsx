import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { getCourt, createBooking } from '../services/api'
import { courts as mockCourts } from '../data/mockData'

export default function BookingForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const courtId = searchParams.get('court')
  const date = searchParams.get('date')
  const slot = searchParams.get('slot')

  const [court, setCourt] = useState(null)
  const [form, setForm] = useState({ name: '', mobile: '', email: '' })
  const [paymentFile, setPaymentFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  
  // 15-minute timer state (900 seconds)
  const [timeLeft, setTimeLeft] = useState(900)

  useEffect(() => {
    if (timeLeft <= 0) {
      alert('Time expired! Please select a slot again.')
      navigate(`/court/${courtId}/slots?date=${date}`)
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, courtId, date, navigate])

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourt(courtId)
        setCourt(data)
      } catch {
        setCourt(mockCourts.find(c => c.id === courtId) || null)
      }
    }
    if (courtId) load()
  }, [courtId])

  if (!courtId || !date || !slot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Invalid booking data</p>
      </div>
    )
  }

  if (!court) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  const formattedDate = new Date(date).toLocaleDateString('en-PK', {
    weekday: 'short', day: 'numeric', month: 'short'
  })

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, payment: 'Please upload an image file' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, payment: 'File size must be under 5MB' }))
      return
    }
    setPaymentFile(file)
    setPreview(URL.createObjectURL(file))
    setErrors(prev => ({ ...prev, payment: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.mobile.trim()) newErrors.mobile = 'Mobile number is required'
    else if (!/^03\d{9}$/.test(form.mobile.replace(/[\s-]/g, ''))) {
      newErrors.mobile = 'Enter valid PK mobile (03XXXXXXXXX)'
    }
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email'
    }
    if (!paymentFile) newErrors.payment = 'Payment screenshot is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('courtId', courtId)
      formData.append('date', date)
      formData.append('slotStart', slot)
      formData.append('customerName', form.name)
      formData.append('mobile', form.mobile)
      formData.append('email', form.email)
      formData.append('paymentScreenshot', paymentFile)

      const result = await createBooking(formData)

      navigate('/success', {
        state: {
          courtName: court.name,
          date: formattedDate,
          slot: `${slot} - ${String(Number(slot.split(':')[0]) + 1).padStart(2, '0')}:00`,
          name: form.name,
          mobile: form.mobile,
          amount: court.pricePerHour,
          bookingId: result.data?.bookingId || result.data?.id,
          qrCode: result.data?.qrCode
        }
      })
    } catch (err) {
      console.error(err)
      if (err.response?.status === 409) {
        setErrors({ form: 'This slot is already booked. Please choose another.' })
      } else {
        setErrors({ form: 'Failed to submit booking. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-lg bg-gray-50 shadow-xl min-h-screen relative pb-28">
        <Header title="Complete Booking" showBack backTo={`/court/${courtId}/slots?date=${date}`} />

        <main className="px-4 py-5">
          {/* Timer Warning */}
          <div className={`flex items-center justify-center gap-2 p-3 mb-5 rounded-xl text-sm font-medium ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Time remaining to complete booking: {formattedTime}
          </div>

          {/* Booking Summary */}
          <div className="bg-primary-600 text-white p-4 rounded-2xl mb-6 shadow-md">
            <h3 className="font-semibold text-lg mb-2">Booking Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-100">Court</span>
                <span className="font-medium">{court.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-100">Date</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-100">Time</span>
                <span className="font-medium">{slot}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-primary-400/50 mt-2">
                <span className="text-primary-100 font-medium">Amount</span>
                <span className="font-bold text-xl">Rs. {court.pricePerHour}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{errors.form}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="Enter your full name"
                className={`input-field ${errors.name ? 'border-red-400' : ''}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
              <input type="tel" name="mobile" value={form.mobile} onChange={handleChange}
                placeholder="03XXXXXXXXX"
                className={`input-field ${errors.mobile ? 'border-red-400' : ''}`} />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className={`input-field ${errors.email ? 'border-red-400' : ''}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Screenshot</label>
              <p className="text-xs text-gray-500 mb-2">Transfer Rs. {court.pricePerHour} and upload screenshot</p>

              {!preview ? (
                <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition hover:bg-gray-50 ${errors.payment ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">Tap to upload screenshot</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <div className="relative">
                  <img src={preview} alt="Payment" className="w-full h-48 object-cover rounded-xl border" />
                  <button type="button" onClick={() => { setPaymentFile(null); setPreview(null) }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {errors.payment && <p className="text-red-500 text-xs mt-1">{errors.payment}</p>}
            </div>

            <button type="submit" disabled={submitting}
              className={`w-full btn-primary mt-2 ${submitting ? 'opacity-70' : ''}`}>
              {submitting ? 'Submitting...' : 'Submit Booking'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Your booking will be confirmed after admin approval
          </p>
        </main>
      </div>
    </div>
  )
}