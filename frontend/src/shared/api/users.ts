import { apiClient } from './client'
import { AuthUser } from './types'

export type UpdateProfilePayload = {
  fullName?: string
  phoneNumber?: string
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const { data } = await apiClient.patch<AuthUser>('/users/me', payload)
  return data
}
