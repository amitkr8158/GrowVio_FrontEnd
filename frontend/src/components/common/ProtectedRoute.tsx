import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, isAnyAdmin, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAnyAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, isSuperAdmin, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isSuperAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export function ContentCreatorRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, isContentCreator, isAdmin, isSuperAdmin, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isContentCreator && !isAdmin && !isSuperAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
