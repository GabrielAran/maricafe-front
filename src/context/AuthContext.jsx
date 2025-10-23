import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext(null)

// Auth reducer function
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  })

  // Cargar token desde localStorage al inicializar
  useEffect(() => {
    const token = localStorage.getItem('maricafe-token')
    const userData = localStorage.getItem('maricafe-user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        dispatch({ 
          type: 'LOGIN', 
          payload: { user, token } 
        })
      } catch (error) {
        console.error('Error loading user data:', error)
        // Limpiar datos corruptos
        localStorage.removeItem('maricafe-token')
        localStorage.removeItem('maricafe-user')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Función para hacer login
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch('http://127.0.0.1:4002/maricafe/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Credenciales inválidas')
      }

      const data = await response.json()
      
      // Guardar token y datos del usuario
      localStorage.setItem('maricafe-token', data.access_token)
      localStorage.setItem('maricafe-user', JSON.stringify(data.user))
      
      dispatch({ 
        type: 'LOGIN', 
        payload: { 
          user: data.user, 
          token: data.access_token 
        } 
      })
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: error.message }
    }
  }

  // Función para hacer logout
  const logout = () => {
    localStorage.removeItem('maricafe-token')
    localStorage.removeItem('maricafe-user')
    // Reset product filters
    window.location.reload() // This will force a reload and reset all services
    dispatch({ type: 'LOGOUT' })
  }

  // Función para registrar usuario
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch('http://localhost:4002/maricafe/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al registrar usuario')
      }

      const data = await response.json()
      
      // Guardar token y datos del usuario
      localStorage.setItem('maricafe-token', data.access_token)
      localStorage.setItem('maricafe-user', JSON.stringify(data.user))
      
      dispatch({ 
        type: 'LOGIN', 
        payload: { 
          user: data.user, 
          token: data.access_token 
        } 
      })
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: error.message }
    }
  }

  // Función para verificar si el usuario es admin
  const isAdmin = () => {
    return state.user?.role === 'ADMIN'
  }

  // Función para actualizar los datos del usuario
  const updateUser = (updatedUserData) => {
    console.log('Updating user with data:', updatedUserData) // Debug
    console.log('Current user before update:', state.user) // Debug
    localStorage.setItem('maricafe-user', JSON.stringify(updatedUserData))
    dispatch({ type: 'SET_USER', payload: updatedUserData })
    console.log('User updated in context') // Debug
  }

  // Función para obtener el token para las peticiones API
  const getAuthHeaders = () => {
    if (state.token) {
      return {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      }
    }
    return {
      'Content-Type': 'application/json'
    }
  }

  const value = {
    ...state,
    login,
    logout,
    register,
    isAdmin,
    updateUser,
    getAuthHeaders
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
