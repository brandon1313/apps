import type { ReactNode } from 'react'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BankOutlined,
  CloseOutlined,
  DashboardOutlined,
  FileTextOutlined,
  FormOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Tooltip } from 'antd'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { AuthUser } from '@/shared/api/types'
import { municipalLogoUrl } from '@/features/public/landing/constants'

type MunicipalSidebarProps = {
  currentPath: string
  user: AuthUser | null
  collapsed: boolean
  onToggle: () => void
  mode?: 'desktop' | 'mobile'
  onNavigate?: () => void
  onLogout?: () => void
}

type NavItem = {
  key: string
  label: string
  href: string
  icon: ReactNode
}

function isActivePath(currentPath: string, href: string): boolean {
  return currentPath === href
}

export function MunicipalSidebar({
  currentPath,
  user,
  collapsed,
  onToggle,
  mode = 'desktop',
  onNavigate,
  onLogout,
}: MunicipalSidebarProps) {
  const navItems: NavItem[] = [
    { key: 'dashboard', label: 'Panel principal', href: '/portal', icon: <DashboardOutlined /> },
    { key: 'profile', label: 'Perfil', href: '/portal/profile', icon: <IdcardOutlined /> },
    ...(user?.role === 'ADMIN' || user?.role === 'WRITER'
      ? [{ key: 'news', label: 'Gestión de noticias', href: '/portal/news', icon: <FileTextOutlined /> }]
      : []),
    ...(user?.role === 'POLICE' || user?.role === 'ADMIN'
      ? [{ key: 'field', label: 'Registrar multa', href: '/portal/field', icon: <FormOutlined /> }]
      : []),
    { key: 'fines', label: 'Multas de tránsito', href: '/portal/fines', icon: <ProfileOutlined /> },
    { key: 'water', label: 'Pago de agua', href: '/portal/water-bills', icon: <WalletOutlined /> },
    { key: 'ornato', label: 'Ornato', href: '/portal/ornato', icon: <BankOutlined /> },
  ]

  const isMobile = mode === 'mobile'

  return (
    <motion.aside
      animate={
        isMobile
          ? { x: 0, opacity: 1 }
          : { width: collapsed ? 92 : 290 }
      }
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'relative flex min-h-screen shrink-0 flex-col overflow-visible border-r border-white/10 bg-[#050a41] text-white',
        isMobile ? 'w-[min(88vw,22rem)]' : '',
      ].join(' ')}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(63,178,255,0.18),transparent_28%),linear-gradient(180deg,rgba(7,11,82,0),rgba(2,5,36,0.75))]" />
      <div className={`relative flex flex-1 flex-col ${collapsed ? 'px-3 pb-4 pt-4' : 'px-5 pb-6 pt-6'}`}>
        {isMobile ? (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/14 bg-white/10 text-white shadow-[0_12px_24px_rgba(0,0,0,0.22)] backdrop-blur transition hover:bg-white/16"
            aria-label="Cerrar menu municipal"
          >
            <CloseOutlined />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-2xl border border-white/14 bg-white/10 text-white shadow-[0_12px_24px_rgba(0,0,0,0.22)] backdrop-blur transition hover:bg-white/16"
            aria-label={collapsed ? 'Expandir menu municipal' : 'Colapsar menu municipal'}
          >
            {collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
          </button>
        )}
        <div
          className={[
            'rounded-[28px] border border-white/10 bg-white/6 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl',
            isMobile ? 'px-4 py-4 pr-16' : collapsed ? 'px-2.5 py-3' : 'px-4 py-4',
          ].join(' ')}
        >
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4'}`}>
            <button
              type="button"
              onClick={onToggle}
              className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1.5 transition hover:scale-[1.02]"
              aria-label="Abrir o cerrar menu municipal"
            >
              <img
                className="h-full w-full object-contain"
                src={municipalLogoUrl}
                alt="Logo Municipalidad de San Juan Sacatepequez"
              />
            </button>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  Municipalidad de
                </p>
                <h2 className="mt-1 text-sm font-extrabold uppercase leading-tight tracking-[0.04em] text-white">
                  San Juan Sacatepequez
                </h2>
              </div>
            ) : null}
          </div>
        </div>

        {!collapsed ? (
          <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">
            <SafetyCertificateOutlined />
            Portal institucional
          </div>
        ) : null}

        <nav className={`flex flex-col gap-2 ${collapsed ? 'mt-6' : 'mt-8'}`}>
          {navItems.map((item) => {
            const active = isActivePath(currentPath, item.href)

            return (
              <Tooltip key={item.key} title={collapsed ? item.label : ''} placement="right">
                <Link to={item.href} className="group relative" onClick={onNavigate}>
                  <motion.div
                    whileHover={isMobile ? undefined : { x: 3 }}
                    transition={{ duration: 0.18 }}
                    className={[
                      'rounded-2xl text-sm font-semibold transition-all duration-200',
                      collapsed ? 'flex items-center justify-center px-0 py-3.5' : 'flex items-center gap-3 px-4 py-3.5',
                      active
                        ? 'border border-sky-300/20 bg-[linear-gradient(135deg,rgba(22,150,255,0.24),rgba(63,178,255,0.08))] text-white shadow-[0_14px_30px_rgba(22,150,255,0.14)]'
                        : 'border border-transparent text-white/74 hover:border-white/8 hover:bg-white/6 hover:text-white',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'flex h-10 w-10 items-center justify-center rounded-2xl text-base transition-colors duration-200',
                        active ? 'bg-white/10 text-sky-100' : 'bg-white/[0.05] text-white/70 group-hover:text-white',
                      ].join(' ')}
                    >
                      {item.icon}
                    </span>
                    {!collapsed ? <span>{item.label}</span> : null}
                  </motion.div>
                </Link>
              </Tooltip>
            )
          })}
        </nav>

        <div className="mt-auto space-y-4">
          {!collapsed ? (
            <div className="rounded-[28px] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(245,177,31,0.14),rgba(255,255,255,0.04))] p-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                Servicios frecuentes
              </p>
              <h3 className="mt-2 text-base font-bold text-white">Consulta tus servicios más usados</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Accede de forma rápida a agua, ornato y multas desde el panel principal.
              </p>
            </div>
          ) : null}
          <Link
            to="/"
            onClick={onNavigate}
            className={[
              'rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white',
              collapsed ? 'flex items-center justify-center px-0 py-3' : 'flex items-center gap-3 px-4 py-3',
            ].join(' ')}
          >
            <HomeOutlined />
            {!collapsed ? <span>Volver al sitio público</span> : null}
          </Link>
          {isMobile && onLogout ? (
            <button
              type="button"
              onClick={() => { onLogout(); onNavigate?.() }}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <LogoutOutlined />
              <span>Cerrar sesión</span>
            </button>
          ) : null}
        </div>
      </div>
    </motion.aside>
  )
}
