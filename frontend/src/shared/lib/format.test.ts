import { describe, it, expect } from 'vitest'
import { formatStatus, formatDate } from './format'

describe('formatStatus', () => {
  it.each([
    ['DRAFT', 'Borrador'],
    ['REVIEW', 'En revisión'],
    ['PUBLISHED', 'Publicado'],
    ['ARCHIVED', 'Archivado'],
    ['PAID', 'Pagado'],
    ['PENDING', 'Pendiente'],
    ['CANCELLED', 'Cancelado'],
  ])('convierte %s → %s', (input, expected) => {
    expect(formatStatus(input)).toBe(expected)
  })

  it('devuelve el valor original si no está mapeado', () => {
    expect(formatStatus('UNKNOWN_STATUS')).toBe('UNKNOWN_STATUS')
  })
})

describe('formatDate', () => {
  it('formatea una fecha ISO en español guatemalteco', () => {
    const result = formatDate('2026-04-01T10:00:00.000Z')
    // El resultado varía por TZ pero debe contener el año y el mes
    expect(result).toMatch(/2026/)
  })

  it('devuelve una cadena no vacía para cualquier fecha válida', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
