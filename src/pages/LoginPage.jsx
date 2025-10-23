import React, { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage({ onNavigate }) {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [capsLock, setCapsLock] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || 'Error de autenticación')
      return
    }
    onNavigate && onNavigate('home')
  }

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
        {error && <p className="text-red-500 text-sm">{error}</p>}
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


