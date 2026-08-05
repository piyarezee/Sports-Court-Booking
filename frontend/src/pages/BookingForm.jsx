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
  const slotStart = searchParams.get('slotStart')
  const slotEnd = searchParams.get('slotEnd')
  const duration = parseInt(searchParams.get('duration') || '1')

  const [court, setCourt] = useState(null)
  const [form, setForm] = useState({ name: '', mobile: '', email: '' })
  const [paymentFile, setPaymentFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  
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

  if (!courtId || !date || !slotStart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invalid booking data</p>
      </div>
    )
  }

  if (!court) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      formData.append('slotStart', slotStart)
      formData.append('slotEnd', slotEnd)
      formData.append('customerName', form.name)
      formData.append('mobile', form.mobile)
      formData.append('email', form.email)
      formData.append('paymentScreenshot', paymentFile)

      const result = await createBooking(formData)

      navigate('/success', {
        state: {
          courtName: court.name,
          date: formattedDate,
          slot: `${slotStart} - ${slotEnd}`,
          name: form.name,
          mobile: form.mobile,
          amount: court.pricePerHour * duration,
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
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header title="Complete Booking" showBack backTo={`/court/${courtId}/slots?date=${date}`} />

      <main className="max-w-lg mx-auto px-4 pt-5">
        <div className={`flex items-center justify-center gap-2 p-3 mb-5 rounded-lg text-sm font-medium ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Time remaining to complete booking: {formattedTime}
        </div>

        <div className="card mb-5 bg-primary-50 border-primary-100">
          <h3 className="font-semibold text-primary-900 mb-2">Booking Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-primary-700">Court</span>
              <span className="font-medium text-primary-900">{court.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-700">Date</span>
              <span className="font-medium text-primary-900">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-700">Time</span>
              <span className="font-medium text-primary-900">{slotStart} - {slotEnd}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-700">Duration</span>
              <span className="font-medium text-primary-900">{duration} Hour(s)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-primary-200">
              <span className="text-primary-700 font-medium">Total Amount</span>
              <span className="font-bold text-primary-900 text-lg">Rs. {court.pricePerHour * duration}</span>
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
            <input
