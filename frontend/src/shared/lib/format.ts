const statusLabels: Record<string, string> = {
  PAID: 'Pagado',
  PENDING: 'Pendiente',
  CANCELLED: 'Cancelado',
  DRAFT: 'Borrador',
  REVIEW: 'En revisión',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
}

export function formatStatus(status: string): string {
  return statusLabels[status] ?? status
}

export function formatCurrency(value: number | string, currency = 'GTQ'): string {
  const amount = typeof value === 'number' ? value : Number(value)

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number.isNaN(amount) ? 0 : amount)
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
  }).format(new Date(value))
}
