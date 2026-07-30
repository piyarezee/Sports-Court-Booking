import axios from 'axios'

// Local pe '/api' (Vite proxy), live pe full backend URL
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL,
  timeout: 30000
})

// Courts
export const getCourts = async () => {
  const res = await api.get('/courts')
  return res.data.data
}

export const getCourt = async (id) => {
  const res = await api.get(`/courts/${id}`)
  return res.data.data
}

export const getSlots = async (courtId, date) => {
  const res = await api.get(`/courts/${courtId}/slots`, { params: { date } })
  return res.data.data
}

// Bookings
export const createBooking = async (formData) => {
  const res = await api.post('/bookings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export default api
