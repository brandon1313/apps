import type { ReactNode } from 'react'
import { CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import type { DashboardActivity } from '@/shared/api/types'
import { formatDateTime } from '@/shared/lib/format'
import { DashboardEmptyState } from './DashboardEmptyState'

type RecentActivityPanelProps = {
  activities: DashboardActivity[]
}

function getActivityVisual(type: DashboardActivity['type']): { icon: ReactNode; tone: string; label: string } {
  if (type === 'PAYMENT') {
    return {
      icon: <CheckCircleOutlined />,
      tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      label: 'Pago',
    }
  }

  if (type === 'NEWS') {
    return {
      icon: <FileTextOutlined />,
      tone: 'bg-sky-50 text-sky-700 ring-sky-100',
      label: 'Noticia',
    }
  }

  return {
    icon: <TeamOutlined />,
    tone: 'bg-amber-50 text-amber-700 ring-amber-100',
    label: 'Usuario',
  }
}

export function RecentActivityPanel({ activities }: RecentActivityPanelProps) {
  if (activities.length === 0) {
    return (
      <DashboardEmptyState
        title="Sin actividad reciente"
        description="Tus pagos y movimientos recientes aparecerán aquí de forma privada cuando existan registros asociados a tu cuenta."
      />
    )
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:rounded-[32px] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Actividad reciente
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950">
            Movimientos y actualizaciones del portal
          </h3>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 sm:inline-flex">
          <ClockCircleOutlined />
          Actualizado en tiempo real
        </div>
      </div>

      <div className="mt-5 space-y-3 sm:mt-6">
        {activities.map((activity, index) => {
          const visual = getActivityVisual(activity.type)

          return (
            <motion.article
              key={activity.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, delay: index * 0.04 }}
              className="group relative rounded-[22px] border border-slate-200 bg-slate-50/60 p-3.5 transition hover:border-slate-300 hover:bg-white sm:rounded-[26px] sm:p-4"
            >
              <div className="flex gap-3 sm:gap-4">
                <div className="relative flex flex-col items-center">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ring-1 sm:h-11 sm:w-11 ${visual.tone}`}>
                    {visual.icon}
                  </span>
                  {index < activities.length - 1 ? (
                    <span className="mt-2 h-full min-h-8 w-px bg-gradient-to-b from-slate-200 to-transparent" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-950">{activity.title}</h4>
                        <span className="hidden rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 ring-1 ring-slate-200 sm:inline-flex">
                          {visual.label}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">{activity.description}</p>
                    </div>
                    <time className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:text-xs">
                      {formatDateTime(activity.timestamp)}
                    </time>
                  </div>
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
