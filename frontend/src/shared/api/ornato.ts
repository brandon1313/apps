import { apiClient } from './client'
import { OrnatoPaymentResult, OrnatoReceiptDocument, OrnatoTicket } from './types'

export type CreateOrnatoPayload = {
  name: string
  dpi: string
  amount: number
}

export async function createOrnatoTicket(payload: CreateOrnatoPayload): Promise<OrnatoTicket> {
  const { data } = await apiClient.post<OrnatoTicket>('/ornato', payload)
  return data
}

export async function payOrnatoTicket(id: string): Promise<OrnatoPaymentResult> {
  const { data } = await apiClient.post<OrnatoPaymentResult>(`/ornato/${id}/pay`)
  return data
}

export async function fetchOrnatoReceipt(id: string): Promise<OrnatoReceiptDocument> {
  const { data } = await apiClient.get<OrnatoReceiptDocument>(`/ornato/${id}/receipt`)
  return data
}
