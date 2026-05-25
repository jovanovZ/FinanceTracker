import { createContext, useState, useEffect, useMemo } from 'react'
import authService from '../services/authService.js'
import apiClient from '../services/api.js'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Ob zagonu — obnovi sejo iz localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')

    if (!savedToken) {
      setLoading(false)
      return
    }

    // Token obstaja — preveri pri serverju kdo je user
    apiClient.get('/auth/me')
      .then(({ user }) => {
        setToken(savedToken)
        setUser(user)
        setIsAuthenticated(true)
      })
      .catch(() => {
        // Token je neveljaven ali potekel — počisti
        localStorage.removeItem('authToken')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    try {
      const { token: newToken, user: newUser } = await authService.login(email, password)
      setToken(newToken)
      setUser(newUser)
      setIsAuthenticated(true)
      return { success: true, user: newUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const { token: newToken, user: newUser } = await authService.register(userData)
      setToken(newToken)
      setUser(newUser)
      setIsAuthenticated(true)
      return { success: true, user: newUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
  }), [user, token, isAuthenticated, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}