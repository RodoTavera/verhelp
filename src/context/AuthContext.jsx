import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('authToken')
    if (!stored || stored === 'undefined' || stored === 'null') return null
    return stored
  })

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/session')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('authToken')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    const response = await api.post('/api/login', credentials)
    const { token: newToken } = response.data
    localStorage.setItem('authToken', newToken)
    setToken(newToken)
    await fetchUser()
    return response.data
  }

  const register = async (endpoint, data) => {
    const response = await api.post(endpoint, data)
    const { token: newToken } = response.data
    localStorage.setItem('authToken', newToken)
    setToken(newToken)
    await fetchUser()
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
