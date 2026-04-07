import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthTokens } from './types'

const ACCESS_TOKEN_STORAGE_KEY = 'municipal_access_token'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the HttpOnly refresh cookie automatically
})

let refreshPromise: Promise<string | null> | null = null
let authFailureHandler: (() => void) | null = null

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function persistAccessToken(accessToken: string): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
}

export function clearStoredAuthTokens(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function registerAuthFailureHandler(handler: (() => void) | null): () => void {
  authFailureHandler = handler

  return () => {
    if (authFailureHandler === handler) {
      authFailureHandler = null
    }
  }
}

function applyAccessToken(config: InternalAxiosRequestConfig, accessToken: string): InternalAxiosRequestConfig {
  config.headers = config.headers ?? {}
  config.headers.Authorization = `Bearer ${accessToken}`
  return config
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    // No body needed — the HttpOnly refresh cookie is sent automatically
    const { data } = await publicApiClient.post<AuthTokens>('/auth/refresh')
    persistAccessToken(data.accessToken)
    return data.accessToken
  } catch {
    clearStoredAuthTokens()
    authFailureHandler?.()
    return null
  }
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken()

  if (accessToken) {
    return applyAccessToken(config, accessToken)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    refreshPromise ??= refreshAccessToken()
    const nextAccessToken = await refreshPromise
    refreshPromise = null

    if (!nextAccessToken) {
      return Promise.reject(error)
    }

    return apiClient(applyAccessToken(originalRequest, nextAccessToken))
  },
)
