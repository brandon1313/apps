import { apiClient } from './client'
import { TrafficFine } from './types'

export type SearchFinesPayload = {
  plateType: 'M' | 'P' | 'C'
  plateNumber: string
}

export type CreateFinePayload = {
  plateType: 'M' | 'P' | 'C'
  plateNumber: string
  reason: string
  amount: number
  evidenceNotes?: string
  evidencePhotoUrl?: string
  issuedAt?: string
}

export async function searchFines(payload: SearchFinesPayload): Promise<TrafficFine[]> {
  const { data } = await apiClient.post<TrafficFine[]>('/fines/search', payload)
  return data
}

export async function payFine(id: string): Promise<TrafficFine> {
  const { data } = await apiClient.post<TrafficFine>(`/fines/${id}/pay`)
  return data
}

export async function createFine(payload: CreateFinePayload): Promise<TrafficFine> {
  const { data } = await apiClient.post<TrafficFine>('/fines', payload)
  return data
}
