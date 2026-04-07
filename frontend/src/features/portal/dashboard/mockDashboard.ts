export type DashboardQuickAction = {
  key: string
  title: string
  description: string
  href: string
  accent: 'blue' | 'amber' | 'green' | 'red' | 'purple'
  cta: string
}

const actionFines: DashboardQuickAction = {
  key: 'fines',
  title: 'Multas de tránsito',
  description: 'Revisa placas, valida evidencias y resuelve infracciones en minutos.',
  href: '/portal/fines',
  accent: 'amber',
  cta: 'Consultar multas',
}

const actionWater: DashboardQuickAction = {
  key: 'water',
  title: 'Pago de agua',
  description: 'Busca facturas pendientes de agua por medidor, dirección o titular.',
  href: '/portal/water-bills',
  accent: 'blue',
  cta: 'Consultar facturas',
}

const actionOrnato: DashboardQuickAction = {
  key: 'ornato',
  title: 'Boleto de ornato',
  description: 'Genera y paga tu boleto de ornato con un flujo rápido y seguro.',
  href: '/portal/ornato',
  accent: 'green',
  cta: 'Pagar boleto',
}

const actionField: DashboardQuickAction = {
  key: 'field',
  title: 'Registrar multa',
  description: 'Registra infracciones en campo con fotografía de evidencia desde tu dispositivo.',
  href: '/portal/field',
  accent: 'red',
  cta: 'Registrar infracción',
}

const actionNews: DashboardQuickAction = {
  key: 'news',
  title: 'Gestión de noticias',
  description: 'Redacta y publica contenido institucional. Controla el estado editorial.',
  href: '/portal/news',
  accent: 'purple',
  cta: 'Ir al CMS',
}

export function getQuickActionsByRole(role: string): DashboardQuickAction[] {
  switch (role) {
    case 'ADMIN':
      return [actionField, actionNews, actionFines, actionWater, actionOrnato]
    case 'POLICE':
      return [actionField, actionFines, actionWater, actionOrnato]
    case 'WRITER':
      return [actionNews, actionFines, actionWater, actionOrnato]
    default:
      return [actionFines, actionWater, actionOrnato]
  }
}
