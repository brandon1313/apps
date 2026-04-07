import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearStoredAuthTokens,
  getStoredAccessToken,
  persistAccessToken,
  registerAuthFailureHandler,
} from '@/shared/api/client'
import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
  type LoginPayload,
  type RegisterPayload,
} from '@/shared/api/auth'
import type { AuthUser } from '@/shared/api/types'

type AuthContextValue = {
  user: AuthUser | null
  isBootstrapping: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const accessToken = getStoredAccessToken()

      if (!accessToken) {
        setIsBootstrapping(false)
        return
      }

      try {
        const currentUser = await fetchCurrentUser()
        setUser(currentUser)
      } catch {
        clearStoredAuthTokens()
        setUser(null)
      } finally {
        setIsBootstrapping(false)
      }
    }

    void bootstrap()
  }, [])

  useEffect(() => {
    return registerAuthFailureHandler(() => {
      clearStoredAuthTokens()
      setUser(null)
      setIsBootstrapping(false)
    })
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { accessToken } = await loginRequest(payload)
    persistAccessToken(accessToken)
    const currentUser = await fetchCurrentUser()
    setUser(currentUser)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const { accessToken } = await registerRequest(payload)
    persistAccessToken(accessToken)
    const currentUser = await fetchCurrentUser()
    setUser(currentUser)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      clearStoredAuthTokens()
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      login,
      register,
      logout,
      setUser,
    }),
    [isBootstrapping, login, logout, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
