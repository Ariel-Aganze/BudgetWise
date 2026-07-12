import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Start with true
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        setLoading(false)
        return
      }
      
      // Verify token and get user
      await fetchUser()
    }
    
    initAuth()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/accounts/profile/')
      setUser(response.data)
      await fetchUnreadCount()
      return true
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // Token might be invalid, clear it
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      return false
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count/')
      setUnreadCount(response.data.unread_count)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/accounts/login/', { email, password })
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      setUser(response.data.user)
      await fetchUnreadCount()
      return response.data
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/accounts/register/', userData)
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      setUser(response.data.user)
      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    setUnreadCount(0)
  }

  const updateUnreadCount = (count) => {
    setUnreadCount(count)
  }

  // Don't render anything while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      isAuthenticated: !!user,
      unreadCount,
      updateUnreadCount,
      fetchUnreadCount,
    }}>
      {children}
    </AuthContext.Provider>
  )
}