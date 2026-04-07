import { apiClient } from './client'
import { WaterBill } from './types'

export type SearchWaterBillsPayload = {
  meterNumber?: string
  address?: string
  accountHolderName?: string
}

export async function searchWaterBills(payload: SearchWaterBillsPayload): Promise<WaterBill[]> {
  const { data } = await apiClient.post<WaterBill[]>('/water-bills/search', payload)
  return data
}

export async function payWaterBill(id: string): Promise<WaterBill> {
  const { data } = await apiClient.post<WaterBill>(`/water-bills/${id}/pay`)
  return data
}
