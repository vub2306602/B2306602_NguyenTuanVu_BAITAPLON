import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Tự động đính kèm Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('client_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Nếu bị 401 Unauthorized (token hết hạn hoặc không hợp lệ)
    if (error.response?.status === 401) {
      const isPortAdmin = window.location.port === '5173'
      if (isPortAdmin) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      } else {
        localStorage.removeItem('client_token')
        localStorage.removeItem('client_user')
      }
    }

    const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!'
    return Promise.reject(new Error(message))
  }
)

export default apiClient

