import { apiClient } from './client'
import { NewsPost, NewsStatus } from './types'

export type CreateNewsPayload = {
  slug: string
  title: string
  summary: string
  coverImageUrl: string
  content: Record<string, unknown>
}

export async function fetchPublicNews(): Promise<NewsPost[]> {
  const { data } = await apiClient.get<NewsPost[]>('/public/news')
  return data
}

export async function fetchPublicNewsBySlug(slug: string): Promise<NewsPost> {
  const { data } = await apiClient.get<NewsPost>(`/public/news/${slug}`)
  return data
}

export async function fetchPortalNews(): Promise<NewsPost[]> {
  const { data } = await apiClient.get<NewsPost[]>('/news')
  return data
}

export async function createNews(payload: CreateNewsPayload): Promise<NewsPost> {
  const { data } = await apiClient.post<NewsPost>('/news', payload)
  return data
}

export async function updateNewsStatus(id: string, status: NewsStatus): Promise<NewsPost> {
  const { data } = await apiClient.patch<NewsPost>(`/news/${id}/status`, { status })
  return data
}
