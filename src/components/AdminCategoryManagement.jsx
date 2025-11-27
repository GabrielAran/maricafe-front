import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, createCategory, updateCategory, deleteCategory, activateCategory, selectCategoryCategories, selectCategoryPending, selectCategoryError } from '../redux/slices/category.slice.js'
import { selectIsAdmin, selectCurrentUser } from '../redux/slices/user.slice.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Notification from './ui/Notification.jsx'
import ConfirmationModal from './ui/ConfirmationModal.jsx'

export default function AdminCategoryManagement() {
  const dispatch = useDispatch()
  const isAdmin = useSelector(selectIsAdmin)
  const user = useSelector(selectCurrentUser)
  const categories = useSelector(selectCategoryCategories)
  const loading = useSelector(selectCategoryPending)
  const categoryError = useSelector(selectCategoryError)
  const hasLoadedCategories = useRef(false)
  const prevPendingRef = useRef(loading)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: ''
  })
  const [saving, setSaving] = useState(false)
  const [lastAction, setLastAction] = useState(null) // 'create' | 'update' | 'delete' | null
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  })
  const [confirmationModal, setConfirmationModal] = useState({
    isVisible: false,
    title: '',
    message: '',
    categoryId: null,
    action: 'deactivate'
  })

  useEffect(() => {
    if (!isAdmin) {
      hasLoadedCategories.current = false
      return
    }
    // Only dispatch if we haven't already dispatched for this admin session
    if (!hasLoadedCategories.current) {
      dispatch(fetchCategories())
      hasLoadedCategories.current = true
    }
  }, [dispatch, isAdmin, user?.role])

  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({ name: '' })
    setShowAddModal(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setFormData({ name: category.name })
    setShowEditModal(true)
  }

  const handleDeleteCategory = (category) => {
    const isCurrentlyActive = category.active !== false
    const action = isCurrentlyActive ? 'deactivate' : 'activate'
    const actionTitle = isCurrentlyActive ? 'Desactivar Categoría' : 'Activar Categoría'
    const actionMessage = isCurrentlyActive
      ? `La categoría "${category.name}" se desactivará y dejará de estar disponible para nuevos productos, pero se mantendrá para fines administrativos.`
      : `La categoría "${category.name}" se activará y volverá a estar disponible para nuevos productos.`

    setConfirmationModal({
      isVisible: true,
      title: actionTitle,
      message: actionMessage,
      categoryId: category.category_id,
      action,
    })
  }

  const confirmDelete = () => {
    if (!confirmationModal.categoryId) return
    setSaving(true)

    if (confirmationModal.action === 'deactivate') {
      setLastAction('deactivate')
      dispatch(deleteCategory(confirmationModal.categoryId))
    } else if (confirmationModal.action === 'activate') {
      setLastAction('activate')
      dispatch(activateCategory(confirmationModal.categoryId))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showNotification('El nombre de la categoría es requerido', 'error')
      return
    }
    if (formData.name.trim().length > 30) {
      showNotification('El nombre de la categoría no puede superar los 30 caracteres', 'error')
      return
    }
    setSaving(true)

    if (editingCategory) {
      setLastAction('update')
      dispatch(updateCategory({ categoryId: editingCategory.category_id ?? editingCategory.id, data: formData }))
    } else {
      setLastAction('create')
      dispatch(createCategory(formData))
    }
  }

  // React to category async operation results
  useEffect(() => {
    const prevPending = prevPendingRef.current

    // Detect transition from pending -> not pending for a tracked action
    if (prevPending && !loading && lastAction) {
      const hasError = !!categoryError

      if (!hasError) {
        // Success paths
        if (lastAction === 'deactivate') {
          showNotification('Categoría desactivada con éxito', 'success')
          setConfirmationModal({ isVisible: false, title: '', message: '', categoryId: null, action: 'deactivate' })
        } else if (lastAction === 'activate') {
          showNotification('Categoría activada con éxito', 'success')
          setConfirmationModal({ isVisible: false, title: '', message: '', categoryId: null, action: 'deactivate' })
        } else if (lastAction === 'update') {
          showNotification('Categoría actualizada con éxito', 'success')
          setShowEditModal(false)
        } else if (lastAction === 'create') {
          showNotification('Categoría creada con éxito', 'success')
          setShowAddModal(false)
        }

        // Reset form after successful create/update
        setEditingCategory(null)
        setFormData({ name: '' })
      } else {
        // Error paths
        if (lastAction === 'deactivate') {
          const msg = categoryError || ''
          if (msg.includes('No se puede eliminar una categoria con Producto')) {
            showNotification(
              'No se puede eliminar esta categoría porque contiene productos. Primero elimina o mueve todos los productos de esta categoría.',
              'error'
            )
          } else {
            showNotification('Error al eliminar la categoría', 'error')
          }
          // Close the confirmation modal when deletion fails
          setConfirmationModal({ isVisible: false, title: '', message: '', categoryId: null, action: 'deactivate' })
        } else if (lastAction === 'activate') {
          showNotification(categoryError || 'Error al activar la categoría', 'error')
          setConfirmationModal({ isVisible: false, title: '', message: '', categoryId: null, action: 'deactivate' })
        } else if (lastAction === 'create' || lastAction === 'update') {
          showNotification(categoryError || 'Error al guardar la categoría', 'error')
        }
      }

      setSaving(false)
      setLastAction(null)
    }

    prevPendingRef.current = loading
  }, [loading, categoryError, lastAction])

  const showNotification = (message, type = 'success') => {
    setNotification({
      isVisible: true,
      message,
      type
    })
    setTimeout(() => {
      setNotification({ isVisible: false, message: '', type: 'success' })
    }, 3000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value.slice(0, 28)
    }))
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Acceso denegado</h2>
        <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
      </div>
    )
  }

  if (loading && categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Cargando categorías...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
          <p className="text-muted-foreground">Administra las categorías de productos</p>
        </div>
        <Button onClick={handleAddCategory} className="bg-primary text-white">
          + Agregar Categoría
        </Button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.category_id ?? category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg flex-1">{category.name}</CardTitle>
              {category.active === false && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  Inactiva
                </span>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCategory(category)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button
                  variant={category.active === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDeleteCategory(category)}
                  className={`flex-1 ${category.active !== false ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''}`}
                >
                  {category.active === false ? 'Activar' : 'Desactivar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No hay categorías</h3>
          <p className="text-muted-foreground mb-4">Comienza agregando tu primera categoría</p>
          <Button onClick={handleAddCategory} className="bg-primary text-white">
            + Agregar Primera Categoría
          </Button>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Agregar Nueva Categoría</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Tortas, Tazas, Catering"
                  maxLength={30}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-white"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Crear Categoría'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Editar Categoría</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Tortas, Tazas, Catering"
                  maxLength={30}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-white"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Actualizar Categoría'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isVisible={confirmationModal.isVisible}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmationModal({ isVisible: false, title: '', message: '', categoryId: null, action: 'deactivate' })}
        confirmText={confirmationModal.action === 'activate' ? 'Activar' : 'Desactivar'}
        cancelText="Cancelar"
        isLoading={saving}
      />

      {/* Notification */}
      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ isVisible: false, message: '', type: 'success' })}
      />
    </div>
  )
}