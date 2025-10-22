import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { User, Edit3, Save, X, Package, Clock, CheckCircle, Lock, Eye, EyeOff, Calendar, DollarSign, ArrowRight } from 'lucide-react'

export default function ProfilePage({ onNavigate }) {
  const { user, getAuthHeaders, isAuthenticated, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Orders state
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      })
    }
  }, [user])

  // Fetch orders when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.role === 'USER') {
      fetchOrders()
    }
  }, [isAuthenticated, user])

  const fetchOrders = async () => {
    setOrdersLoading(true)
    setOrdersError('')
    
    try {
      const response = await fetch('http://localhost:4002/orders/user', {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error al cargar las órdenes')
      }

      const ordersData = await response.json()
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrdersError('Error al cargar las órdenes')
    } finally {
      setOrdersLoading(false)
    }
  }

  // Update form data when user data changes (after successful update)
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      })
    }
  }, [user, isEditing])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch(`http://localhost:4002/users/${user.userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar perfil')
      }

      const data = await response.json()
      console.log('Server response:', data) // Debug: see what the server returns
      console.log('Server user data:', data.data) // Debug: see the user data structure
      setMessage('Perfil actualizado exitosamente')
      setIsEditing(false)
      
      // Update user data in context and localStorage with the server response data
      // Map backend field names to frontend field names
      const serverUserData = data.data // The server returns the updated user in data.data
      const updatedUser = {
        userId: serverUserData.user_id,
        firstName: serverUserData.first_name,
        lastName: serverUserData.last_name,
        email: serverUserData.email,
        role: serverUserData.role
      }
      console.log('Mapped user data:', updatedUser) // Debug: see the mapped user data
      updateUser(updatedUser)
      
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      })
    }
    setIsEditing(false)
    setMessage('')
  }

  // Password change handlers
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handlePasswordChange = async () => {
    setPasswordLoading(true)
    setPasswordMessage('')
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage('Todos los campos son obligatorios')
      setPasswordLoading(false)
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('Las contraseñas nuevas no coinciden')
      setPasswordLoading(false)
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('La nueva contraseña debe tener al menos 6 caracteres')
      setPasswordLoading(false)
      return
    }
    
    try {
      const response = await fetch(`http://localhost:4002/users/${user.userId}/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al cambiar contraseña')
      }

      const data = await response.json()
      setPasswordMessage('Contraseña actualizada exitosamente')
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
    } catch (error) {
      setPasswordMessage(`Error: ${error.message}`)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handlePasswordCancel = () => {
    setIsChangingPassword(false)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordMessage('')
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleOrderClick = (orderId) => {
    onNavigate && onNavigate('order-details', { orderId })
  }

  // Redirect if not authenticated or not USER role
  if (!isAuthenticated || user?.role !== 'USER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-4">
            Solo los usuarios con rol USER pueden acceder a esta página.
          </p>
          <button 
            onClick={() => onNavigate('home')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y revisa tus órdenes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                )}
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-md ${
                  message.includes('Error') 
                    ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ingresa tu nombre"
                    />
                  ) : (
                    <p className="text-foreground">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Apellido
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ingresa tu apellido"
                    />
                  ) : (
                    <p className="text-foreground">{user.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ingresa tu email"
                    />
                  ) : (
                    <p className="text-foreground">{user.email}</p>
                  )}
                </div>


                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {loading ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 border border-input text-foreground rounded-md hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Cambiar Contraseña
                </h2>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    Cambiar
                  </button>
                )}
              </div>

              {passwordMessage && (
                <div className={`mb-4 p-3 rounded-md ${
                  passwordMessage === 'Contraseña actualizada exitosamente'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {passwordMessage}
                </div>
              )}

              {isChangingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full px-3 py-2 pr-10 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full px-3 py-2 pr-10 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full px-3 py-2 pr-10 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handlePasswordChange}
                      disabled={passwordLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {passwordLoading ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                    <button
                      onClick={handlePasswordCancel}
                      className="flex items-center gap-2 px-4 py-2 border border-input text-foreground rounded-md hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <p>Haz clic en "Cambiar" para actualizar tu contraseña.</p>
                  <p className="text-sm mt-1">Por seguridad, necesitarás ingresar tu contraseña actual.</p>
                </div>
              )}
            </div>
          </div>

          {/* Mis Ordenes Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <Package className="h-5 w-5" />
                Mis Órdenes
              </h2>
              
              {ordersLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Cargando órdenes...</p>
                </div>
              ) : ordersError ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Error al cargar órdenes
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {ordersError}
                  </p>
                  <button 
                    onClick={fetchOrders}
                    className="text-sm bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No tienes órdenes
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cuando realices tu primera compra, aparecerá aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.order_id} 
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleOrderClick(order.order_id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatearFecha(order.order_date)}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-primary">
                            {formatearPrecio(order.total_price)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      
                      {order.items && order.items.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {order.items.slice(0, 2).map((item, index) => (
                            <span key={index}>
                              {item.name} ({item.quantity})
                              {index < Math.min(order.items.length, 2) - 1 && ', '}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span> y {order.items.length - 2} más...</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
