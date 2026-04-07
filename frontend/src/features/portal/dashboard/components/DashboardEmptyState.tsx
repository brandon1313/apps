import { Empty } from 'antd'
import { motion } from 'framer-motion'

type DashboardEmptyStateProps = {
  title: string
  description: string
}

export function DashboardEmptyState({ title, description }: DashboardEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[220px] items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 p-6"
    >
      <Empty
        description={
          <div className="space-y-2">
            <p className="text-base font-semibold text-slate-900">{title}</p>
            <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">{description}</p>
          </div>
        }
      />
    </motion.div>
  )
}
