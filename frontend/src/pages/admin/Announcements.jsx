import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function Announcements() {
  const navigate = useNavigate()
  const token = localStorage.getItem('adminToken')
  
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    try {
      await axios.post(`${API}/notifications/announce`, 
        { title, message },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('Announcement sent to all users successfully!')
      setTitle('')
      setMessage('')
    } catch (err) {
      alert('Failed to send announcement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-10">
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link to="/admin" className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Send Announcement</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            Broadcast Message
          </h2>
          <p className="text-sm text-slate-400 mb-6">This message will appear in the notification bell of all users who have the app installed.</p>
          
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Maintenance Notice" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Type your announcement here..." 
                rows="5"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 resize-none"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send to All Users'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
