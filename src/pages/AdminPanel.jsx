import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminPanel() {
  const { isAuthenticated, isAdmin, user } = useAuth()

  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Acceso denegado</h1>
        <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <p className="text-sm text-muted-foreground mb-6">Hola {user?.firstName}, gestiona productos, categorías, descuentos y órdenes.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Productos</h2>
          <p className="text-sm text-muted-foreground">Crear, editar o eliminar productos.</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Categorías</h2>
          <p className="text-sm text-muted-foreground">Gestiona las categorías.</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Descuentos</h2>
          <p className="text-sm text-muted-foreground">Configura descuentos.</p>
        </div>
      </div>
    </div>
  )
}


