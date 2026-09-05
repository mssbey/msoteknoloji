import axios from 'axios'
import { toast } from 'sonner'
import { resolveApiBaseUrl } from './apiBase'

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: false,
})

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Adres tarayıcıda çözülür: site hangi host üzerinden açıldıysa API de oradan.
    config.baseURL = resolveApiBaseUrl()
    const token = localStorage.getItem('mso_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || 'Bir hata oluştu'
    if (err.response?.status === 401) {
      localStorage.removeItem('mso_token')
      localStorage.removeItem('mso_user')
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/giris')) {
        window.location.href = '/giris'
      }
    } else if (err.response?.status >= 500) {
      toast.error('Sunucu hatası. Lütfen tekrar deneyin.')
    } else if (err.response?.status === 422) {
      // Validation errors handled in components
    } else if (err.response?.status !== 401) {
      toast.error(msg)
    }
    return Promise.reject(err)
  }
)

// ─── Auth ───────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// ─── Products ───────────────────────────────────────
export const productsAPI = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get('/products', { params }),
  show: (slug: string) => api.get(`/products/${slug}`),
  variants: (slug: string) => api.get(`/products/${slug}/variants`),
  reviews: (slug: string, page = 1) =>
    api.get(`/products/${slug}/reviews`, { params: { page } }),
  addReview: (slug: string, data: Record<string, unknown>) =>
    api.post(`/products/${slug}/reviews`, data),
}

// ─── Categories ─────────────────────────────────────
export const categoriesAPI = {
  list: () => api.get('/categories'),
  show: (slug: string) => api.get(`/categories/${slug}`),
}

// ─── Search ─────────────────────────────────────────
export const searchAPI = {
  search: (q: string, params?: Record<string, string | number>) =>
    api.get('/search', { params: { q, ...params } }),
  suggestions: (q: string) =>
    api.get('/search/suggestions', { params: { q } }),
}

// ─── Orders ─────────────────────────────────────────
export const ordersAPI = {
  list: () => api.get('/orders'),
  show: (orderNumber: string) => api.get(`/orders/${orderNumber}`),
  create: (data: Record<string, unknown>) => api.post('/orders', data),
  cancel: (id: number) => api.post(`/orders/${id}/cancel`),
}

// ─── Blog ───────────────────────────────────────────
export const blogAPI = {
  list: (params?: Record<string, string | number>) => api.get('/blog', { params }),
  show: (slug: string) => api.get(`/blog/${slug}`),
  categories: () => api.get('/blog/categories'),
}

// ─── Leads ──────────────────────────────────────────
export const leadsAPI = {
  create: (data: Record<string, unknown>) => api.post('/leads', data),
}

// ─── Seller ─────────────────────────────────────────
export const sellerAPI = {
  dashboard: () => api.get('/seller/dashboard'),
  products: {
    list: (params?: Record<string, string | number>) =>
      api.get('/seller/products', { params }),
    create: (data: FormData | Record<string, unknown>) =>
      api.post('/seller/products', data),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/seller/products/${id}`, data),
    delete: (id: number) => api.delete(`/seller/products/${id}`),
  },
  orders: {
    list: (params?: Record<string, string | number>) =>
      api.get('/seller/orders', { params }),
  },
}
