import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext.jsx'
import { useProductService } from '../hooks/useProductService.js'
import {
  createBulkDiscounts,
  updateDiscount,
  deleteDiscount,
  deleteBulkDiscounts,
  clearError,
} from '../store/slices/discountSlice.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Badge from './ui/Badge.jsx'
import Notification from './ui/Notification.jsx'
import ConfirmationModal from './ui/ConfirmationModal.jsx'

export default function AdminDiscountManagement() {
  const dispatch = useDispatch()
  const { isAdmin } = useAuth()
  const {
    products,
    loading,
    error,
    loadProducts,
    formatPrice
  } = useProductService()

  // Redux state for discounts
  const { loading: discountLoading, error: discountError } = useSelector(
    (state) => state.discount
  )

  const [selectedProducts, setSelectedProducts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  })
  const [confirmationModal, setConfirmationModal] = useState({
    isVisible: false,
    title: '',
    message: '',
    action: null
  })

  // Combined loading state
  const saving = discountLoading

  useEffect(() => {
    if (isAdmin()) {
      loadProducts()
    }
  }, [isAdmin, loadProducts])

  const showNotification = (message, type = 'success') => {
    setNotification({
      isVisible: true,
      message,
      type
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }))
  }

  // Filter products with discounts
  const productsWithDiscounts = products.filter(p => p.descuento && p.descuento > 0)
  const productsWithoutDiscounts = products.filter(p => !p.descuento || p.descuento === 0)

  // Search filter
  const filteredProducts = productsWithoutDiscounts.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const handleOpenAddModal = () => {
    if (selectedProducts.length === 0) {
      showNotification('Selecciona al menos un producto', 'error')
      return
    }
    setDiscountPercentage('')
    setShowAddModal(true)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setDiscountPercentage('')
  }

  const handleOpenEditModal = (product) => {
    console.log('handleOpenEditModal called with product:', product)
    console.log('product.descuentoId:', product.descuentoId)
    setEditingDiscount(product)
    setDiscountPercentage(product.descuento ? product.descuento.toString() : '')
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingDiscount(null)
    setDiscountPercentage('')
  }

  const handleCreateDiscounts = async () => {
    const percentage = parseFloat(discountPercentage)
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      showNotification('El porcentaje debe estar entre 0 y 100', 'error')
      return
    }

    try {
      await dispatch(createBulkDiscounts({
        productIds: selectedProducts,
        discountPercentage: percentage,
      })).unwrap()

      showNotification(
        `Descuento del ${percentage}% aplicado a ${selectedProducts.length} producto(s)`,
        'success'
      )
      handleCloseAddModal()
      setSelectedProducts([])
      await loadProducts()
    } catch (error) {
      console.error('Error creating discounts:', error)
      const errorMessage = error || 'Error desconocido'
      showNotification('Error al crear descuentos: ' + errorMessage, 'error')
      dispatch(clearError())
    }
  }

  const handleUpdateDiscount = async () => {
    if (!editingDiscount) {
      return
    }
    const percentage = parseFloat(discountPercentage)
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      showNotification('El porcentaje debe estar entre 0 y 100', 'error')
      return
    }
    
    if (!editingDiscount.descuentoId) {
      showNotification('No se encontró el ID del descuento', 'error')
      return
    }

    try {
      await dispatch(updateDiscount({
        discountId: editingDiscount.descuentoId,
        discountPercentage: percentage,
      })).unwrap()

      showNotification(
        `Descuento actualizado a ${percentage}% para "${editingDiscount.nombre}"`,
        'success'
      )
      handleCloseEditModal()
      await loadProducts()
    } catch (error) {
      console.error('Error updating discount:', error)
      const errorMessage = error || 'Error desconocido'
      showNotification('Error al actualizar descuento: ' + errorMessage, 'error')
      dispatch(clearError())
    }
  }

  const handleDeleteDiscount = (product) => {
    setConfirmationModal({
      isVisible: true,
      title: 'Eliminar Descuento',
      message: `¿Estás seguro de que quieres eliminar el descuento del ${product.descuento}% de "${product.nombre}"?`,
      action: () => confirmDeleteDiscount(product)
    })
  }

  const handleBulkDeleteDiscounts = () => {
    const selectedDiscountProducts = productsWithDiscounts.filter(p =>
      selectedProducts.includes(p.id)
    )

    if (selectedDiscountProducts.length === 0) {
      showNotification('Selecciona al menos un producto con descuento', 'error')
      return
    }

    setConfirmationModal({
      isVisible: true,
      title: 'Eliminar Descuentos',
      message: `¿Estás seguro de que quieres eliminar los descuentos de ${selectedDiscountProducts.length} producto(s)?`,
      action: () => confirmBulkDeleteDiscounts(selectedDiscountProducts)
    })
  }

  const confirmDeleteDiscount = async (product) => {
    if (!product.descuentoId) {
      showNotification('No se encontró el ID del descuento', 'error')
      setConfirmationModal({
        isVisible: false,
        title: '',
        message: '',
        action: null
      })
      return
    }

    try {
      await dispatch(deleteDiscount(product.descuentoId)).unwrap()
      
      showNotification(
        `Descuento eliminado de "${product.nombre}"`,
        'success'
      )
      await loadProducts()
    } catch (error) {
      console.error('Error deleting discount:', error)
      const errorMessage = error || 'Error desconocido'
      showNotification('Error al eliminar descuento: ' + errorMessage, 'error')
      dispatch(clearError())
    } finally {
      setConfirmationModal({
        isVisible: false,
        title: '',
        message: '',
        action: null
      })
    }
  }

  const confirmBulkDeleteDiscounts = async (discountProducts) => {
    const discountIds = discountProducts
      .filter(p => p.descuentoId)
      .map(p => p.descuentoId)

    if (discountIds.length === 0) {
      showNotification('No se encontraron IDs de descuento válidos', 'error')
      setConfirmationModal({
        isVisible: false,
        title: '',
        message: '',
        action: null
      })
      return
    }

    try {
      await dispatch(deleteBulkDiscounts(discountIds)).unwrap()
      
      showNotification(
        `${discountIds.length} descuento(s) eliminado(s) exitosamente`,
        'success'
      )
      setSelectedProducts([])
      await loadProducts()
    } catch (error) {
      console.error('Error deleting discounts:', error)
      const errorMessage = error || 'Error desconocido'
      showNotification('Error al eliminar descuentos: ' + errorMessage, 'error')
      dispatch(clearError())
    } finally {
      setConfirmationModal({
        isVisible: false,
        title: '',
        message: '',
        action: null
      })
    }
  }

  const handleCancelConfirmation = () => {
    setConfirmationModal({
      isVisible: false,
      title: '',
      message: '',
      action: null
    })
  }

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Acceso Denegado</h2>
          <p className="text-muted-foreground">Solo los administradores pueden acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Gestión de Descuentos</h2>
        <p className="text-muted-foreground">
          Aplica, modifica o elimina descuentos en uno o varios productos.
        </p>
      </div>


      {/* Products with Discounts */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Productos con Descuento</h3>
        </div>

        {productsWithDiscounts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay productos con descuento actualmente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsWithDiscounts.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate text-base">{product.nombre}</span>
                    <Badge variant="destructive">{product.descuento}% OFF</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Precio original:</p>
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.precioOriginal)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Precio con descuento:</p>
                          <p className="text-lg font-semibold text-primary">
                            {formatPrice(product.precio)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEditModal(product)
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDiscount(product)
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Products without Discounts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Agregar Descuentos</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleOpenAddModal}
              disabled={selectedProducts.length === 0}
            >
              Aplicar Descuento ({selectedProducts.length})
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full border rounded px-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Select All */}
        {filteredProducts.length > 0 && (
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                Seleccionar todos ({filteredProducts.length})
              </span>
            </label>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'No se encontraron productos'
                  : 'Todos los productos tienen descuento'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all ${
                  selectedProducts.includes(product.id)
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleSelectProduct(product.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="truncate text-base">{product.nombre}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.descripcion}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        {formatPrice(product.precio)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Discount Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Aplicar Descuento a {selectedProducts.length} Producto(s)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Porcentaje de Descuento (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full border rounded px-3 py-2"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="Ej: 15"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ingresa un valor entre 0 y 100
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleCloseAddModal}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateDiscounts}
                disabled={saving || !discountPercentage || parseFloat(discountPercentage) <= 0}
                className="flex-1"
              >
                {saving ? 'Aplicando...' : 'Aplicar Descuento'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Discount Modal */}
      {showEditModal && editingDiscount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Editar Descuento: {editingDiscount.nombre}
            </h3>
            <div className="space-y-4">
              {/* Product Info */}
              <div className="bg-muted p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Precio original:</span>
                  <span className="text-sm">{formatPrice(editingDiscount.precioOriginal)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Descuento actual:</span>
                  <span className="text-sm">{editingDiscount.descuento}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Precio actual:</span>
                  <span className="text-sm font-semibold text-primary">{formatPrice(editingDiscount.precio)}</span>
                </div>
              </div>

              {/* New Discount Input */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nuevo Porcentaje de Descuento (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full border rounded px-3 py-2"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ingresa un valor entre 0 y 100
                </p>
              </div>

              {/* Preview */}
              {parseFloat(discountPercentage) > 0 && parseFloat(discountPercentage) !== editingDiscount.descuento && (
                <div className="bg-primary/10 p-3 rounded border border-primary/20">
                  <p className="text-xs font-medium mb-1">Vista previa:</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nuevo precio:</span>
                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(editingDiscount.precioOriginal * (1 - parseFloat(discountPercentage) / 100))}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleCloseEditModal}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateDiscount}
                disabled={saving || !discountPercentage || parseFloat(discountPercentage) <= 0 || parseFloat(discountPercentage) === editingDiscount.descuento}
                className="flex-1"
              >
                {saving ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={4000}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isVisible={confirmationModal.isVisible}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={confirmationModal.action}
        onCancel={handleCancelConfirmation}
        type="danger"
      />
    </div>
  )
}
