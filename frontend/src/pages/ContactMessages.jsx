import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function ContactMessages() {
  const navigate = useNavigate()
  const token = localStorage.getItem('adminToken')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${API}/admin/contact`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setMessages(res.data.data.reverse())
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <button onClick={() => navigate('/admin')} className="mr-4 text-gray-600">←</button>
          <h1 className="font-bold text-lg">Contact Messages</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {messages.length === 0 ? (
            <p className="p-8 text-center text-gray-400">No messages yet</p>
          ) : (
            <div className="divide-y">
              {messages.map((m, i) => (
                <div key={i} className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-gray-900">{m.name}</p>
                    <span className="text-xs text-gray-400">{new Date(m.date || m.created_at).toLocaleDateString()}</span>
                  </div>
                  <a href={`mailto:${m.email}`} className="text-sm text-primary-600 block mb-2">{m.email}</a>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}