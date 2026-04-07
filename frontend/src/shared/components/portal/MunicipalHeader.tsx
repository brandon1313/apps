import { BellOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { motion } from 'framer-motion'
import type { AuthUser } from '@/shared/api/types'

type MunicipalHeaderProps = {
  title: string
  description: string
  user: AuthUser | null
  onLogout: () => Promise<void>
  isDesktop: boolean
  onOpenMenu: () => void
}

function getInitials(name: string | undefined): string {
  if (!name) {
    return 'SJ'
  }

  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function MunicipalHeader({
  title,
  description,
  user,
  onLogout,
  isDesktop,
  onOpenMenu,
}: MunicipalHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/86 backdrop-blur-xl">
      <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Portal municipal
            </p>
            <h1 className="mt-1 truncate text-lg font-bold tracking-[-0.03em] text-slate-950 sm:text-xl lg:text-2xl">
              {title}
            </h1>
            {isDesktop ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isDesktop ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-600"
                type="button"
                aria-label="Abrir menu municipal"
                onClick={onOpenMenu}
              >
                <MenuOutlined />
              </motion.button>
            ) : null}
          <Tooltip title="Próximamente">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm opacity-60 cursor-not-allowed"
              type="button"
              aria-label="Notificaciones (próximamente)"
              aria-disabled="true"
              disabled
            >
              <BellOutlined />
            </motion.button>
          </Tooltip>

          <div className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm ${isDesktop ? 'min-w-[230px]' : ''}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1696ff,#0d1565)] text-sm font-bold text-white">
              {getInitials(user?.fullName)}
            </div>
            {isDesktop ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.fullName ?? 'Usuario municipal'}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                    {({ ADMIN: 'Administrador', USER: 'Ciudadano', WRITER: 'Redactor', POLICE: 'Agente de tránsito' } as Record<string, string>)[user?.role ?? ''] ?? 'Ciudadano'}
                  </span>
                  <span className="text-xs font-medium text-emerald-600">Cuenta activa</span>
                </div>
              </div>
            ) : null}
          </div>

            {isDesktop ? (
              <Button
                icon={<LogoutOutlined />}
                onClick={() => void onLogout()}
                className="!h-11 !rounded-2xl !border-slate-200 !font-semibold !text-slate-700 hover:!border-slate-300 hover:!text-slate-900"
              >
                Cerrar sesión
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
