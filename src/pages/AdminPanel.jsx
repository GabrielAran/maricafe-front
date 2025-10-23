import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import AdminProductManagement from '../components/AdminProductManagement.jsx'
import AdminDiscountManagement from '../components/AdminDiscountManagement.jsx'
import AdminOrdersManagement from '../components/AdminOrdersManagement.jsx'

export default function AdminPanel() {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Acceso denegado</h1>
        <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <AdminProductManagement />
      case 'categories':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Gestión de Categorías</h2>
            <p className="text-muted-foreground">Funcionalidad en desarrollo...</p>
          </div>
        )
      case 'discounts':
        return <AdminDiscountManagement />
      case 'orders':
        return <AdminOrdersManagement />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">Productos</h2>
              <p className="text-sm text-muted-foreground mb-4">Crear, editar o eliminar productos.</p>
              <button 
                onClick={() => setActiveTab('products')}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Gestionar Productos →
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">Categorías</h2>
              <p className="text-sm text-muted-foreground mb-4">Gestiona las categorías.</p>
              <button 
                onClick={() => setActiveTab('categories')}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Gestionar Categorías →
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">Descuentos</h2>
              <p className="text-sm text-muted-foreground mb-4">Configura descuentos.</p>
              <button 
                onClick={() => setActiveTab('discounts')}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Gestionar Descuentos →
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">Órdenes</h2>
              <p className="text-sm text-muted-foreground mb-4">Gestiona todas las órdenes.</p>
              <button 
                onClick={() => setActiveTab('orders')}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Gestionar Órdenes →
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground">
          Hola {user?.firstName}, gestiona productos, categorías, descuentos y órdenes.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            Categorías
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'discounts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            Descuentos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            Órdenes
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </div>
  )
}


