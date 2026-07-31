import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

export default function Payments() {
  const navigate = useNavigate()
  const token = localStorage.getItem('adminToken')
  const [payments, setPayments] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${API}/admin/payments`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPayments(res.data.data.reverse())
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
          <h1 className="font-bold text-lg">Payments & Transactions</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {payments.length === 0 ? (
            <p className="p-8 text-center text-gray-400">No payments recorded yet</p>
          ) : (
            <div className="divide-y">
              {payments.map((p, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{p.customer_name || p.name}</p>
                    <p className="text-xs text-gray-500">{p.payment_id || p.id} · {p.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Rs. {p.amount}</p>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}