import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function StaffLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API}/admin/staff/login`, { password })
      localStorage.setItem('staffToken', res.data.token)
      navigate('/staff/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Staff Login</h1>
        <p className="text-gray-500 text-sm mb-6">Enter password to scan QR codes</p>
        
        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Staff Password"
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary w-full">Login as Staff</button>
        </form>
      </div>
    </div>
  )
}