import { Button, Result, Spin } from 'antd'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth-provider'
import type { UserRole } from '@/shared/api/types'

type RoleRouteProps = {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <Spin fullscreen />
  }

  if (!user) {
    return <Navigate to="/portal/login" replace state={{ from: location.pathname }} />
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="Acceso restringido"
        subTitle="No tienes permisos para administrar noticias municipales."
        extra={
          <Link to="/portal">
            <Button type="primary">Volver al portal</Button>
          </Link>
        }
      />
    )
  }

  return <>{children}</>
}
