import { apiClient } from './client'
import { AuthTokens, AuthUser } from './types'

export type RegisterPayload = {
  fullName: string
  dpi: string
  email: string
  password: string
  phoneNumber?: string
}

export type LoginPayload = {
  email: string
  password: string
}

export async function loginRequest(payload: LoginPayload): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/login', payload)
  return data
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/register', payload)
  return data
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/users/me')
  return data
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout')
}
