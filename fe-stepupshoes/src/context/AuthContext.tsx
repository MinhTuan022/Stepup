import React, { createContext, useState, useCallback, useEffect } from 'react'
import type { LoginRequest, JwtResponse, AuthContextType } from '../types'
import { authService } from '../services/api'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<JwtResponse | null>(() => authService.getUser())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.login(credentials)
      setUser(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại, vui lòng thử lại'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setError(null)
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
