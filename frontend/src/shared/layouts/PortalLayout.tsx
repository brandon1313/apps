import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/shared/auth/auth-provider'
import { MunicipalHeader } from '@/shared/components/portal/MunicipalHeader'
import { MunicipalSidebar } from '@/shared/components/portal/MunicipalSidebar'
import { useDesktopLayout } from '@/shared/hooks/useDesktopLayout'

export function PortalLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const isDesktop = useDesktopLayout()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const pageTitles: Record<string, { title: string; description: string }> = {
    '/portal': {
      title: 'Dashboard municipal',
      description: 'Visualiza tu estado general, resuelve pagos prioritarios y accede a los servicios digitales más usados.',
    },
    '/portal/profile': {
      title: 'Perfil ciudadano',
      description: 'Administra tus datos personales y mantén actualizada tu información de contacto.',
    },
    '/portal/news': {
      title: 'Gestión de noticias',
      description: 'Publica, revisa y administra contenido institucional con una presentación clara.',
    },
    '/portal/fines': {
      title: 'Multas de tránsito',
      description: 'Consulta infracciones, revisa evidencias y procesa pagos de forma guiada.',
    },
    '/portal/water-bills': {
      title: 'Pago de agua',
      description: 'Busca cuentas pendientes y procesa facturas con una experiencia clara y segura.',
    },
    '/portal/ornato': {
      title: 'Boleto de ornato',
      description: 'Genera el boleto, valida datos del contribuyente y completa el pago en línea.',
    },
  }

  const currentPage = pageTitles[location.pathname] ?? pageTitles['/portal']

  useEffect(() => {
    if (isDesktop) {
      setMobileMenuOpen(false)
    }
  }, [isDesktop])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4fb_0%,#f8fbff_100%)] text-slate-950">
      <div className="flex min-h-screen">
        {isDesktop ? (
          <MunicipalSidebar
            currentPath={location.pathname}
            user={user}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((current) => !current)}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <MunicipalHeader
            title={currentPage.title}
            description={currentPage.description}
            user={user}
            onLogout={logout}
            isDesktop={isDesktop}
            onOpenMenu={() => setMobileMenuOpen(true)}
          />
          <main id="main-content" className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
            <Outlet />
          </main>
        </div>
      </div>
      <AnimatePresence>
        {!isDesktop && mobileMenuOpen ? (
          <>
            <motion.button
              key="portal-overlay"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px]"
              aria-label="Cerrar menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              key="portal-drawer"
              initial={{ x: '-100%', opacity: 0.7 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0.7 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50"
            >
              <MunicipalSidebar
                currentPath={location.pathname}
                user={user}
                collapsed={false}
                onToggle={() => setMobileMenuOpen(false)}
                mode="mobile"
                onNavigate={() => setMobileMenuOpen(false)}
                onLogout={() => { void logout(); setMobileMenuOpen(false) }}
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
