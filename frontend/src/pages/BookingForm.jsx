import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getCourt, createBooking } from '../services/api'
import { courts as mockCourts } from '../data/mockData'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function BookingForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const courtId = searchParams.get('court')
  const date = searchParams.get('date')
  const slotStart = searchParams.get('slotStart') || searchParams.get('slot')
  const slotEnd = searchParams.get('slotEnd') || (slotStart ? `${String(Number(slotStart.split(':')[0]) + 1).padStart(2, '0')}:00` : '')
  const duration = parseInt(searchParams.get('duration') || '1')

  const [court, setCourt] = useState(null)
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState({ name: '', mobile: '', email: '', paymentMethod: 'JazzCash' })
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
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, courtId, date, navigate])

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourt(courtId)
        setCourt(data)
        const settingsRes = await axios.get(`${API}/settings`)
        if (settingsRes.data?.success) setSettings(settingsRes.data.data)
      } catch {
        setCourt(mockCourts.find(c => c.id === courtId) || null)
      }
    }
    if (courtId) load()
  }, [courtId])

  if (!courtId || !date || !slotStart) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Invalid booking data</div>
  if (!court) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>

  const formattedDate = new Date(date).toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })
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
    if (!file.type.startsWith('image/')) return setErrors(prev => ({ ...prev, payment: 'Please upload an image file' }))
    if (file.size > 5 * 1024 * 1024) return setErrors(prev => ({ ...prev, payment: 'File size must be under 5MB' }))
    setPaymentFile(file)
    setPreview(URL.createObjectURL(file))
    setErrors(prev => ({ ...prev, payment: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.mobile.trim()) newErrors.mobile = 'Mobile number is required'
    else if (!/^03\d{9}$/.test(form.mobile.replace(/[\s-]/g, ''))) newErrors.mobile = 'Enter valid PK mobile (03XXXXXXXXX)'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email'
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
      formData.append('paymentMethod', form.paymentMethod)
      formData.append('paymentScreenshot', paymentFile)

      const result = await createBooking(formData)
      navigate('/success', {
        state: {
          courtName: court.name, date: formattedDate, slot: `${slotStart} - ${slotEnd}`,
          name: form.name, mobile: form.mobile, amount: court.pricePerHour * duration,
          bookingId: result.data?.bookingId || result.data?.id, qrCode: result.data?.qrCode
        }
      })
    } catch (err) {
      if (err.response?.status === 409) setErrors({ form: 'This slot is already booked. Please choose another.' })
      else setErrors({ form: 'Failed to submit booking. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const getPaymentDetails = () => {
    if (form.paymentMethod === 'Bank Transfer') return { title: settings?.bankTitle, account: settings?.bankAccount }
    if (form.paymentMethod === 'JazzCash') return { title: settings?.jazzcashTitle, account: settings?.jazzcashAccount }
    if (form.paymentMethod === 'Easypaisa') return { title: settings?.easypaisaTitle, account: settings?.easypaisaAccount }
    return { title: '', account: '' }
  }

  const currentPayment = getPaymentDetails()

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden pb-28">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full filter blur-[120px]"></div>
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-5">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/court/${courtId}/slots?date=${date}`)} className="p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="font-bold text-lg">Complete Booking</h1>
        </div>

        <div className={`flex items-center justify-center gap-2 p-3 mb-5 rounded-xl text-sm font-medium backdrop-blur-md border ${timeLeft < 60 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Time remaining: {formattedTime}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg mb-5">
          <h3 className="font-semibold text-white mb-3">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Court</span><span className="font-medium text-white">{court.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="font-medium text-white">{formattedDate}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Time</span><span className="font-medium text-white">{slotStart} - {slotEnd}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="font-medium text-white">{duration} Hour(s)</span></div>
            <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-slate-300 font-medium">Total Amount</span><span className="font-bold text-primary-400 text-lg">Rs. {court.pricePerHour * duration}</span></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{errors.form}</p>}

          {/* Payment Method Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['Bank Transfer', 'JazzCash', 'Easypaisa'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, paymentMethod: method }))}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      form.paymentMethod === method 
                        ? 'bg-primary-500 text-white shadow-md' 
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {settings && (
              <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 mb-1">Account Title</p>
                <p className="font-semibold text-white text-sm mb-3">{currentPayment.title || 'Loading...'}</p>
                <p className="text-xs text-slate-400 mb-1">Account Number</p>
                <div className="flex justify-between items-center">
                  <p className="font-mono font-bold text-primary-300 text-lg tracking-wider">{currentPayment.account || 'Loading...'}</p>
                  {currentPayment.account && (
                    <button type="button" onClick={() => navigator.clipboard.writeText(currentPayment.account)} className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20">Copy</button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" className={`w-full bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500`} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile Number</label>
            <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} placeholder="03XXXXXXXXX" className={`w-full bg-white/5 border ${errors.mobile ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500`} />
            {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500`} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Payment Screenshot</label>
            <p className="text-xs text-slate-500 mb-2">Transfer Rs. {court.pricePerHour * duration} via {form.paymentMethod} and upload screenshot</p>
            {!preview ? (
              <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition hover:bg-white/5 ${errors.payment ? 'border-red-500' : 'border-white/20'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-sm text-slate-400">Tap to upload screenshot</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="relative">
                <img src={preview} alt="Payment" className="w-full h-48 object-cover rounded-xl border border-white/10" />
                <button type="button" onClick={() => { setPaymentFile(null); setPreview(null) }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            {errors.payment && <p className="text-red-400 text-xs mt-1">{errors.payment}</p>}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-white/10 p-4 z-30">
            <div className="max-w-lg mx-auto">
              <button type="submit" disabled={submitting} className={`w-full py-4 rounded-xl text-center font-bold text-sm transition-all duration-300 ${submitting ? 'bg-white/10 text-slate-500' : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30'}`}>
                {submitting ? 'Submitting...' : 'Submit Booking'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
