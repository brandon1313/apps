import type { ReactNode } from 'react'
import {
  ArrowRightOutlined,
  BankOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  FormOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { DashboardQuickAction } from '@/features/portal/dashboard/mockDashboard'

type DashboardQuickActionsProps = {
  actions: DashboardQuickAction[]
}

const accentMap: Record<DashboardQuickAction['accent'], string> = {
  blue: 'from-sky-500/12 to-sky-500/0 border-sky-100',
  amber: 'from-amber-400/14 to-amber-400/0 border-amber-100',
  green: 'from-emerald-400/14 to-emerald-400/0 border-emerald-100',
  red: 'from-red-400/14 to-red-400/0 border-red-100',
  purple: 'from-violet-400/14 to-violet-400/0 border-violet-100',
}

function getActionIcon(key: string): ReactNode {
  if (key === 'fines') return <FileProtectOutlined />
  if (key === 'ornato') return <BankOutlined />
  if (key === 'field') return <FormOutlined />
  if (key === 'news') return <FileTextOutlined />
  return <WalletOutlined />
}

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:rounded-[32px] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Accesos directos
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950">
            Consulta tus servicios más usados
          </h3>
        </div>
        <p className="hidden text-sm text-slate-500 sm:block">Acciones frecuentes del ciudadano</p>
      </div>

      <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.06 }}
          >
            <Link
              to={action.href}
              className={`group flex min-h-[164px] h-full flex-col rounded-[24px] border bg-gradient-to-br ${accentMap[action.accent]} p-4 transition hover:-translate-y-1 hover:shadow-[0_20px_34px_rgba(15,23,42,0.08)] sm:min-h-[176px] sm:rounded-[28px] sm:p-5`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                {getActionIcon(action.key)}
              </span>
              <h4 className="mt-4 text-base font-bold tracking-[-0.02em] text-slate-950 sm:mt-5 sm:text-lg">{action.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
              <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-900 sm:mt-5">
                {action.cta}
                <ArrowRightOutlined className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
