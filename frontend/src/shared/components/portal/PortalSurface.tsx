import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type PortalSurfaceProps = {
  title?: string
  description?: string
  extra?: ReactNode
  children: ReactNode
  className?: string
}

export function PortalSurface({
  title,
  description,
  extra,
  children,
  className = '',
}: PortalSurfaceProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] lg:p-6 ${className}`}
    >
      {title || description || extra ? (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950">{title}</h3> : null}
            {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          {extra ? <div className="shrink-0">{extra}</div> : null}
        </div>
      ) : null}
      {children}
    </motion.section>
  )
}
