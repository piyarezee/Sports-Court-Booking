import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function WalkIn() {
  const navigate = useNavigate()
  const token = localStorage.getItem('adminToken')
  const [form, setForm] = useState({ customerName: '', mobile: '', courtName: '', date: '', time: '', amount: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${API}/admin/walk-ins`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Walk-in added successfully!')
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add walk-in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-lg bg-gray-50 shadow-xl min-h-screen">
        <header className="bg-white border-b p-4">
          <div className="max-w-lg mx-auto flex items-center">
            <button onClick={() => navigate('/admin')} className="mr-4 text-gray-600">←</button>
            <h1 className="font-bold text-lg">Walk-in Cash Entry</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto p-4">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
            <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Customer Name" className="input-field" required />
            <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile (Optional)" className="input-field" />
            <input name="courtName" value={form.courtName} onChange={handleChange} placeholder="Court Name" className="input-field" required />
            <input type="date" name="date" value={form.date} onChange={handleChange} className="input-field" required />
            <input name="time" value={form.time} onChange={handleChange} placeholder="Time (e.g., 19:00 - 20:00)" className="input-field" required />
            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Amount (Rs.)" className="input-field" required />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Saving...' : 'Save Walk-in'}
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}