import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectIsAdmin, selectCurrentUser } from '../redux/slices/user.slice.js'
import AdminProductManagement from '../components/AdminProductManagement.jsx'
import AdminCategoryManagement from '../components/AdminCategoryManagement.jsx'
import AdminDiscountManagement from '../components/AdminDiscountManagement.jsx'
import AdminOrdersManagement from '../components/AdminOrdersManagement.jsx'
import AdminDashboard from '../components/AdminDashboard.jsx'

export default function AdminPanel() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdminUser = useSelector(selectIsAdmin)
  const user = useSelector(selectCurrentUser)
  const [activeTab, setActiveTab] = useState('overview')

  if (!isAuthenticated || !isAdminUser) {
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
        return <AdminCategoryManagement />
      case 'discounts':
        return <AdminDiscountManagement />
      case 'orders':
        return <AdminOrdersManagement />
      default:
        return <AdminDashboard />
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


