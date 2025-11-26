import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../components/ui/Button.jsx'
import { 
  loginUser, 
  selectCurrentUser, 
  selectIsAuthenticated, 
  selectIsAdmin, 
  selectUserPending, 
  selectUserError 
} from '../redux/slices/user.slice.js'

export default function LoginPage({ onNavigate }) {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdminUser = useSelector(selectIsAdmin)
  const loading = useSelector(selectUserPending)
  const authError = useSelector(selectUserError)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [capsLock, setCapsLock] = useState(false)
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false)
  const hasRedirected = useRef(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setHasAttemptedLogin(true)
    dispatch(loginUser({ email, password }))
  }

  React.useEffect(() => {
    if (!hasRedirected.current && hasAttemptedLogin && isAuthenticated && currentUser) {
      hasRedirected.current = true
      if (currentUser.role === 'ADMIN' || isAdminUser) {
        onNavigate && onNavigate('admin')
      } else {
        onNavigate && onNavigate('home')
      }
    }
  }, [hasAttemptedLogin, isAuthenticated, currentUser, isAdminUser, onNavigate])

  // Map low-level auth errors to user-friendly Spanish messages
  const getFriendlyAuthError = () => {
    if (!authError) return ''

    // Wrong credentials typically come back as a 401 from Axios
    if (authError.includes('401')) {
      return 'Contraseña incorrecta'
    }

    // Fallback: show a generic login error without leaking raw technical details
    return 'Ocurrió un error al iniciar sesión. Intenta nuevamente.'
  }

  const effectiveAuthError = error || (authError ? getFriendlyAuthError() : '')

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Iniciar sesión</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.getModifierState) setCapsLock(e.getModifierState('CapsLock'))
            }}
            onKeyUp={(e) => {
              if (e.getModifierState) setCapsLock(e.getModifierState('CapsLock'))
            }}
            onBlur={() => setCapsLock(false)}
            className="w-full border rounded-md px-3 py-2"
            required
          />
          {capsLock && (
            <p className="text-yellow-700 text-sm mt-1">Caps Lock está activado — asegúrate de escribir la contraseña correctamente.</p>
          )}
        </div>
        {effectiveAuthError && (
          <p className="text-red-500 text-sm">{effectiveAuthError}</p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
      <div className="mt-4 text-sm">
        ¿No tienes cuenta?{' '}
        <button className="text-primary underline" onClick={() => onNavigate && onNavigate('register')}>
          Registrate
        </button>
      </div>
    </div>
  )
}


