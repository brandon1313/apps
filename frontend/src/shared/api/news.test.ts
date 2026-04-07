import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchPublicNews,
  fetchPublicNewsBySlug,
  fetchPortalNews,
  createNews,
  updateNewsStatus,
} from './news'
import type { NewsPost } from './types'

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

import { apiClient } from './client'

const mockPost: NewsPost = {
  id: '1',
  slug: 'noticia-de-prueba',
  title: 'Noticia de prueba',
  summary: 'Resumen de prueba',
  coverImageUrl: 'https://example.com/cover.jpg',
  content: { type: 'doc', content: [] },
  status: 'PUBLISHED',
  publishedAt: '2026-04-01T10:00:00.000Z',
  authorId: 'author-1',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchPublicNews', () => {
  it('llama a GET /public/news y devuelve el arreglo', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [mockPost] })

    const result = await fetchPublicNews()

    expect(apiClient.get).toHaveBeenCalledWith('/public/news')
    expect(result).toEqual([mockPost])
  })
})

describe('fetchPublicNewsBySlug', () => {
  it('llama a GET /public/news/:slug y devuelve la noticia', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockPost })

    const result = await fetchPublicNewsBySlug('noticia-de-prueba')

    expect(apiClient.get).toHaveBeenCalledWith('/public/news/noticia-de-prueba')
    expect(result).toEqual(mockPost)
  })
})

describe('fetchPortalNews', () => {
  it('llama a GET /news y devuelve el arreglo', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [mockPost] })

    const result = await fetchPortalNews()

    expect(apiClient.get).toHaveBeenCalledWith('/news')
    expect(result).toEqual([mockPost])
  })
})

describe('createNews', () => {
  it('llama a POST /news con el payload y devuelve la noticia creada', async () => {
    const payload = {
      slug: 'nueva-noticia',
      title: 'Nueva noticia',
      summary: 'Resumen',
      coverImageUrl: 'https://example.com/img.jpg',
      content: { type: 'doc', content: [] },
    }
    vi.mocked(apiClient.post).mockResolvedValue({ data: { ...mockPost, ...payload } })

    const result = await createNews(payload)

    expect(apiClient.post).toHaveBeenCalledWith('/news', payload)
    expect(result.slug).toBe('nueva-noticia')
  })
})

describe('updateNewsStatus', () => {
  it('llama a PATCH /news/:id/status con el nuevo estado', async () => {
    const updated = { ...mockPost, status: 'ARCHIVED' as const }
    vi.mocked(apiClient.patch).mockResolvedValue({ data: updated })

    const result = await updateNewsStatus('1', 'ARCHIVED')

    expect(apiClient.patch).toHaveBeenCalledWith('/news/1/status', { status: 'ARCHIVED' })
    expect(result.status).toBe('ARCHIVED')
  })
})
