import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type PortalPageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  meta?: string[]
  extra?: ReactNode
}

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  meta = [],
  extra,
}: PortalPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="min-w-0">
        {eyebrow ? (
          <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 ring-1 ring-sky-100">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 lg:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 lg:text-base">
          {description}
        </p>
        {meta.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {meta.map((item) => (
              <span
                key={item}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {extra ? <div className="shrink-0">{extra}</div> : null}
    </motion.div>
  )
}
