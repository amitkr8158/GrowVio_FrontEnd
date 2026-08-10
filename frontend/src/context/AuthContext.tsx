import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/authService'

interface User {
  id?: number
  name?: string
  email?: string
  role?: string
  plan?: string
  token?: string
  [key: string]: unknown
}

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isContentCreator: boolean
  isAnyAdmin: boolean
  isPremium: boolean
  isPro: boolean
  isLoggedIn: boolean
  login: (authResponse: User & { token: string }) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'))

  // Validate stored token on mount by calling /api/users/me
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken && !user) {
      setLoading(true)
      authService.getMe()
        .then((res) => {
          const userData = res.data
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = (authResponse: User & { token: string }) => {
    localStorage.setItem('token', authResponse.token)
    localStorage.setItem('user', JSON.stringify(authResponse))
    setToken(authResponse.token)
    setUser(authResponse)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const role = user?.role ?? ''
  const plan = user?.plan ?? ''

  const isAdmin          = role === 'ADMIN'
  const isSuperAdmin     = role === 'SUPER_ADMIN'
  const isContentCreator = role === 'CONTENT_CREATOR'
  const isAnyAdmin       = ['ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR'].includes(role)
  const isPro            = plan === 'PRO'
  const isPremium        = ['PREMIUM', 'PRO'].includes(plan) || isAdmin || isSuperAdmin
  const isLoggedIn       = !!token

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAdmin, isSuperAdmin, isContentCreator, isAnyAdmin,
      isPremium, isPro, isLoggedIn,
      login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
