import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth-provider'
import { Spin } from 'antd'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <Spin fullscreen />
  }

  if (!user) {
    return <Navigate to="/portal/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
