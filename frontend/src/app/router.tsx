import { lazy, Suspense, Component, type ComponentType, type LazyExoticComponent, type ReactElement, type ReactNode, type ErrorInfo } from 'react'
import { Button, Result, Spin } from 'antd'
import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/shared/layouts/PublicLayout'
import { PortalLayout } from '@/shared/layouts/PortalLayout'
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute'
import { RoleRoute } from '@/shared/auth/RoleRoute'
import { NotFoundPage } from '@/features/NotFoundPage'

type ErrorBoundaryState = { hasError: boolean }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route error:', error, info)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="No fue posible cargar esta página"
          subTitle="Ocurrió un error inesperado. Intenta nuevamente."
          extra={[
            <Button key="retry" type="primary" onClick={() => this.setState({ hasError: false })}>
              Reintentar
            </Button>,
          ]}
        />
      )
    }

    return this.props.children
  }
}

const LandingPage = lazy(async () => {
  const module = await import('@/features/public/landing/LandingPage')
  return { default: module.LandingPage }
})

const PublicNewsPage = lazy(async () => {
  const module = await import('@/features/public/news/PublicNewsPage')
  return { default: module.PublicNewsPage }
})

const PublicNewsDetailPage = lazy(async () => {
  const module = await import('@/features/public/news/PublicNewsDetailPage')
  return { default: module.PublicNewsDetailPage }
})

const LoginPage = lazy(async () => {
  const module = await import('@/features/auth/LoginPage')
  return { default: module.LoginPage }
})

const RegisterPage = lazy(async () => {
  const module = await import('@/features/auth/RegisterPage')
  return { default: module.RegisterPage }
})

const DashboardPage = lazy(async () => {
  const module = await import('@/features/portal/dashboard/DashboardPage')
  return { default: module.DashboardPage }
})

const ProfilePage = lazy(async () => {
  const module = await import('@/features/profile/ProfilePage')
  return { default: module.ProfilePage }
})

const NewsManagementPage = lazy(async () => {
  const module = await import('@/features/news/NewsManagementPage')
  return { default: module.NewsManagementPage }
})

const TrafficFinesPage = lazy(async () => {
  const module = await import('@/features/fines/TrafficFinesPage')
  return { default: module.TrafficFinesPage }
})

const WaterBillsPage = lazy(async () => {
  const module = await import('@/features/water-bills/WaterBillsPage')
  return { default: module.WaterBillsPage }
})

const OrnatoPage = lazy(async () => {
  const module = await import('@/features/ornato/OrnatoPage')
  return { default: module.OrnatoPage }
})

const CreateFinePage = lazy(async () => {
  const module = await import('@/features/field/CreateFinePage')
  return { default: module.CreateFinePage }
})

function renderLazy(Component: LazyExoticComponent<ComponentType>): ReactElement {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spin fullscreen />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: renderLazy(LandingPage) },
      { path: 'news', element: renderLazy(PublicNewsPage) },
      { path: 'news/:slug', element: renderLazy(PublicNewsDetailPage) },
      { path: 'portal/login', element: renderLazy(LoginPage) },
      { path: 'portal/register', element: renderLazy(RegisterPage) },
    ],
  },
  {
    path: '/portal',
    element: (
      <ProtectedRoute>
        <PortalLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: renderLazy(DashboardPage) },
      { path: 'profile', element: renderLazy(ProfilePage) },
      {
        path: 'news',
        element: (
          <RoleRoute allowedRoles={['ADMIN', 'WRITER']}>
            {renderLazy(NewsManagementPage)}
          </RoleRoute>
        ),
      },
      {
        path: 'field',
        element: (
          <RoleRoute allowedRoles={['POLICE', 'ADMIN']}>
            {renderLazy(CreateFinePage)}
          </RoleRoute>
        ),
      },
      { path: 'fines', element: renderLazy(TrafficFinesPage) },
      { path: 'water-bills', element: renderLazy(WaterBillsPage) },
      { path: 'ornato', element: renderLazy(OrnatoPage) },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
