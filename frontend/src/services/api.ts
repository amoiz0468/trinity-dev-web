import axios from 'axios'

// Use relative URL to leverage Vite proxy during dev
const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  // Let axios set Content-Type so FormData uploads work
  headers: {},
})

const AUTH_SKIP_PATHS = ['/auth/token/', '/auth/token/refresh/', '/auth/register/']

const shouldSkipAuth = (url?: string) =>
  !!url && AUTH_SKIP_PATHS.some((path) => url.includes(path))

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (shouldSkipAuth(config.url)) {
      return config
    }
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipAuth(originalRequest.url)
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('Missing refresh token')
        }
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem('access_token', access)

        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
