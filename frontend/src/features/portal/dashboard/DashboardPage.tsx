import {
  Alert,
  Skeleton,
  Space,
} from 'antd'
import { useEffect, useState } from 'react'
import {
  CheckCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { fetchDashboardSummary } from '@/shared/api/dashboard'
import type { DashboardSummary } from '@/shared/api/types'
import { useAuth } from '@/shared/auth/auth-provider'
import { DashboardKpiCard } from './components/DashboardKpiCard'
import { DashboardQuickActions } from './components/DashboardQuickActions'
import { DashboardSummaryHero } from './components/DashboardSummaryHero'
import { RecentActivityPanel } from './components/RecentActivityPanel'
import { getQuickActionsByRole } from './mockDashboard'

export function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const role = user?.role ?? 'USER'
  const isAdmin = role === 'ADMIN'
  const isWriter = role === 'WRITER'
  const isPolice = role === 'POLICE'

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true)
      setError(null)

      try {
        const nextSummary = await fetchDashboardSummary()
        setSummary(nextSummary)
      } catch {
        setError('No fue posible cargar el resumen municipal.')
      } finally {
        setLoading(false)
      }
    }

    void loadSummary()
  }, [])

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {error ? <Alert type="error" message={error} /> : null}

      {loading || !summary ? (
        <div className="grid gap-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[32px] sm:p-8">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <DashboardSummaryHero
            pendingPaymentsCount={summary.pendingPaymentsCount}
            userName={user?.fullName ?? 'Ciudadano'}
            role={role}
          />

          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div className="order-1">
              <DashboardQuickActions actions={getQuickActionsByRole(role)} />
            </div>

            <div className={`order-2 grid gap-4 ${isAdmin ? 'md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3' : isPolice ? 'md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'}`}>
              <DashboardKpiCard
                title="Pagos procesados hoy"
                value={summary.successfulPaymentsTodayCount}
                icon={<CheckCircleOutlined />}
                tone="green"
                helper="Transacciones completadas exitosamente en el día."
              />
              <DashboardKpiCard
                title="Pagos pendientes"
                value={summary.pendingPaymentsCount}
                icon={<WalletOutlined />}
                tone="amber"
                helper={
                  summary.pendingPaymentsCount === 0
                    ? 'No hay pagos pendientes. Todo está al día.'
                    : 'Resuelve los servicios pendientes para mantener tus gestiones al día.'
                }
              />
              {isAdmin ? (
                <DashboardKpiCard
                  title="Usuarios activos"
                  value={summary.activeUsersCount}
                  icon={<TeamOutlined />}
                  tone="blue"
                  helper="Indicador reservado para administración y monitoreo institucional."
                />
              ) : isWriter ? (
                <DashboardKpiCard
                  title="Noticias publicadas"
                  value={summary.publishedNewsCount}
                  icon={<FileTextOutlined />}
                  tone="blue"
                  helper="Contenido institucional activo y visible para la ciudadanía."
                />
              ) : isPolice ? null : (
                <DashboardKpiCard
                  title="Noticias publicadas"
                  value={summary.publishedNewsCount}
                  icon={<FileTextOutlined />}
                  tone="blue"
                  helper="Consulta la actividad informativa visible para la ciudadanía."
                />
              )}
            </div>
          </div>

          <RecentActivityPanel activities={summary.recentActivity} />
        </>
      )}
    </Space>
  )
}
