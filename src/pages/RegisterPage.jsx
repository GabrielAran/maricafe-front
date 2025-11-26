import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../components/ui/Button.jsx'
import {
  registerUser,
  selectCurrentUser,
  selectIsAdmin,
  selectUserPending,
  selectUserError,
} from '../redux/slices/user.slice.js'

export default function RegisterPage({ onNavigate }) {
  const dispatch = useDispatch()

  const currentUser = useSelector(selectCurrentUser)
  const isAdminUser = useSelector(selectIsAdmin)
  const loading = useSelector(selectUserPending)
  const backendError = useSelector(selectUserError)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setHasSubmitted(true)
    dispatch(
      registerUser({
        firstname: firstName,
        lastname: lastName,
        email,
        password,
      })
    )
  }

  useEffect(() => {
    if (!hasSubmitted) return

    if (backendError) {
      setError(backendError || 'Error al registrar')
    }
  }, [backendError, hasSubmitted])

  useEffect(() => {
    if (!hasSubmitted) return
    if (!currentUser) return

    if (isAdminUser) {
      onNavigate && onNavigate('admin')
    } else {
      onNavigate && onNavigate('home')
    }
  }, [hasSubmitted, currentUser, isAdminUser, onNavigate])

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Crear cuenta</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Apellido</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
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
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creando...' : 'Crear cuenta'}
        </Button>
      </form>
      <div className="mt-4 text-sm">
        ¿Ya tienes cuenta?{' '}
        <button className="text-primary underline" onClick={() => onNavigate && onNavigate('login')}>
          Inicia sesión
        </button>
      </div>
    </div>
  )
}


