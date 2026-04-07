import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type DashboardKpiCardProps = {
  title: string
  value: number
  icon: ReactNode
  tone: 'blue' | 'green' | 'amber'
  helper: string
}

const toneMap: Record<DashboardKpiCardProps['tone'], string> = {
  blue: 'from-sky-50 to-white text-sky-700 ring-sky-100',
  green: 'from-emerald-50 to-white text-emerald-700 ring-emerald-100',
  amber: 'from-amber-50 to-white text-amber-700 ring-amber-100',
}

export function DashboardKpiCard({ title, value, icon, tone, helper }: DashboardKpiCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <strong className="mt-2 block text-[1.8rem] font-black tracking-[-0.04em] text-slate-950 sm:mt-3 sm:text-[2rem]">
            {value}
          </strong>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneMap[tone]}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-sm leading-6 text-slate-500 ${tone === 'amber' ? 'block' : 'hidden sm:block'}`}>{helper}</p>
    </motion.article>
  )
}
