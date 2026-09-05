import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  roles?: string[]
  seller?: { id: number; package: string; status: string; company_name: string }
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await authAPI.login(email, password)
          const { user, token } = res.data.data
          localStorage.setItem('mso_token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const res = await authAPI.register(data)
          const { user, token } = res.data.data
          localStorage.setItem('mso_token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await authAPI.logout()
        } catch { /* ignore */ }
        localStorage.removeItem('mso_token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        const token = get().token || localStorage.getItem('mso_token')
        if (!token) return
        try {
          const res = await authAPI.me()
          set({ user: res.data.data, isAuthenticated: true })
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
          localStorage.removeItem('mso_token')
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'mso-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
)
