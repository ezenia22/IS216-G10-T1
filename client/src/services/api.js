import axios from 'axios'

const TOKEN_KEY = 'petsociety_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

// In dev, Vite proxies /api to the Express server (see vite.config.js).
// For production builds, set VITE_API_URL to the full API URL INCLUDING /api.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// Attach the login token to every request
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Turn any failed request into a list of readable messages
export function errorMessages(err) {
  const data = err.response?.data
  if (data?.errors) return data.errors
  if (data?.message) return [data.message]
  return ['Cannot reach the server.']
}

const get = (url, params) => api.get(url, { params }).then((res) => res.data)
const post = (url, body) => api.post(url, body).then((res) => res.data)
const put = (url, body) => api.put(url, body).then((res) => res.data)
const patch = (url, body) => api.patch(url, body).then((res) => res.data)
const del = (url) => api.delete(url).then((res) => res.data)

export const authApi = {
  register: (form) => post('/auth/register', form),
  login: (creds) => post('/auth/login', creds),
  me: () => get('/auth/me'),
  updateMe: (updates) => put('/auth/me', updates),
  logout: () => post('/auth/logout'),
}

export const petsApi = {
  getAll: () => get('/pets'),
  getById: (id) => get(`/pets/${id}`),
  create: (pet) => post('/pets', pet),
  update: (id, pet) => put(`/pets/${id}`, pet),
  remove: (id) => del(`/pets/${id}`),
}

export const sittersApi = {
  getAll: (filters) => get('/sitters', filters),   // { petType, maxRate, location, service }
  getById: (id) => get(`/sitters/${id}`),
}

export const bookingsApi = {
  getMine: (status) => get('/bookings', status ? { status } : undefined),
  getById: (id) => get(`/bookings/${id}`),
  create: (booking) => post('/bookings', booking),
  updateStatus: (id, status) => patch(`/bookings/${id}/status`, { status }),
}

export const reviewsApi = {
  getForSitter: (sitterId) => get('/reviews', { sitter: sitterId }),
  create: (review) => post('/reviews', review),
  update: (id, review) => put(`/reviews/${id}`, review),
  remove: (id) => del(`/reviews/${id}`),
}

export const ownersApi = {
  getFavourites: () => get('/owners/me/favourites'),
  addFavourite: (sitterId) => post(`/owners/me/favourites/${sitterId}`),
  removeFavourite: (sitterId) => del(`/owners/me/favourites/${sitterId}`),
  getById: (id) => get(`/owners/${id}`),
}

export default api