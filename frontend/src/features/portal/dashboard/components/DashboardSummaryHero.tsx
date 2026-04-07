import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

type DashboardSummaryHeroProps = {
  pendingPaymentsCount: number
  userName: string
  role: string
}

function getHeroContent(role: string, isClear: boolean, userName: string, pendingCount: number) {
  if (role === 'POLICE') {
    return {
      eyebrow: 'Agente de tránsito',
      headline: 'Listo para registrar infracciones',
      body: `${userName}, desde aquí puedes registrar multas en campo y consultar el historial de infracciones activas.`,
      primaryLabel: 'Registrar infracción',
      primaryTo: '/portal/field',
      secondaryLabel: 'Ver multas',
      secondaryTo: '/portal/fines',
      statusLabel: 'Turno activo',
      recommendation: 'Usa la cámara del dispositivo para capturar evidencia fotográfica al registrar cada infracción.',
    }
  }

  if (role === 'WRITER') {
    return {
      eyebrow: 'Redactor institucional',
      headline: isClear ? 'Todo está al día' : 'Tus pagos pendientes necesitan atención',
      body: isClear
        ? `${userName}, no tienes pagos pendientes. Puedes crear o revisar contenido institucional desde el CMS.`
        : `${userName}, tienes ${pendingCount} gestiones pendientes. Resuélvelas y luego gestiona el contenido editorial.`,
      primaryLabel: isClear ? 'Ir al CMS' : 'Resolver ahora',
      primaryTo: isClear ? '/portal/news' : '/portal/water-bills',
      secondaryLabel: 'Consultar servicios',
      secondaryTo: '/portal/fines',
      statusLabel: isClear ? 'Sin pendientes' : `${pendingCount} pendientes`,
      recommendation: isClear
        ? 'Redacta y publica noticias institucionales para mantener informada a la ciudadanía.'
        : 'Prioriza pagos pendientes para mantener tus servicios al día.',
    }
  }

  if (role === 'ADMIN') {
    return {
      eyebrow: 'Panel de administración',
      headline: isClear ? 'Todo está al día' : 'Tus pagos pendientes necesitan atención',
      body: isClear
        ? `${userName}, la plataforma opera con normalidad. Supervisa usuarios, noticias e infracciones desde los accesos directos.`
        : `${userName}, tienes ${pendingCount} gestiones pendientes. Resuélvelas y revisa el estado general del sistema.`,
      primaryLabel: isClear ? 'Ver actividad' : 'Resolver ahora',
      primaryTo: isClear ? '/portal/profile' : '/portal/water-bills',
      secondaryLabel: 'Registrar infracción',
      secondaryTo: '/portal/field',
      statusLabel: isClear ? 'Sin pendientes' : `${pendingCount} pendientes`,
      recommendation: isClear
        ? 'Supervisa la actividad del portal y publica contenido institucional cuando sea necesario.'
        : 'Prioriza los pagos pendientes para mantener los registros administrativos al día.',
    }
  }

  // USER (default)
  return {
    eyebrow: 'Estado del ciudadano',
    headline: isClear ? 'Todo está al día' : 'Tus pagos pendientes necesitan atención',
    body: isClear
      ? `${userName}, no tienes pagos pendientes en este momento. Puedes revisar tus servicios más usados o consultar nuevas gestiones.`
      : `${userName}, actualmente tienes ${pendingCount} gestiones pendientes entre agua, ornato o multas. Prioriza su resolución desde los accesos directos.`,
    primaryLabel: isClear ? 'Revisar mi perfil' : 'Resolver ahora',
    primaryTo: isClear ? '/portal/profile' : '/portal/water-bills',
    secondaryLabel: 'Consultar servicios',
    secondaryTo: '/portal/fines',
    statusLabel: isClear ? 'Sin pendientes' : `${pendingCount} pendientes`,
    recommendation: isClear
      ? 'Consulta tus servicios más usados y mantente atento a nuevas noticias institucionales.'
      : 'Prioriza pagos pendientes para mantener tus servicios y registros al día.',
  }
}

export function DashboardSummaryHero({ pendingPaymentsCount, userName, role }: DashboardSummaryHeroProps) {
  const isClear = pendingPaymentsCount === 0
  const hero = getHeroContent(role, isClear, userName, pendingPaymentsCount)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#071133_0%,#0d1565_55%,#1696ff_100%)] px-5 py-5 text-white shadow-[0_28px_60px_rgba(5,10,65,0.26)] sm:rounded-[32px] sm:px-6 sm:py-6 lg:px-8 lg:py-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,177,31,0.22),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(63,178,255,0.2),transparent_30%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100/80">
            {hero.eyebrow}
          </p>
          <h2 className="mt-3 text-[1.85rem] font-black tracking-[-0.04em] text-white sm:text-3xl lg:text-4xl">
            {hero.headline}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50/86 sm:leading-7 lg:text-base">
            {hero.body}
          </p>
          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              to={hero.primaryTo}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-50"
            >
              {hero.primaryLabel}
              <ArrowRightOutlined />
            </Link>
            <Link
              to={hero.secondaryTo}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              {hero.secondaryLabel}
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isClear || role === 'POLICE' ? 'bg-emerald-400/18 text-emerald-100' : 'bg-amber-300/18 text-amber-100'}`}>
                {isClear || role === 'POLICE' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
                  Estado general
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  {hero.statusLabel}
                </p>
              </div>
            </div>
          </div>
          <div className="hidden rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
              Recomendación
            </p>
            <p className="mt-3 text-sm leading-6 text-white/84">
              {hero.recommendation}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
