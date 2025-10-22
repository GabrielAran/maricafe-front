import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useProductService } from '../hooks/useProductService.js'
import { ProductApiService } from '../services/ProductApiService.js'
import { categoryService } from '../services/CategoryService.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Badge from './ui/Badge.jsx'
import Notification from './ui/Notification.jsx'
import ConfirmationModal from './ui/ConfirmationModal.jsx'

export default function AdminProductManagement() {
  const { isAdmin } = useAuth()
  const {
    products,
    loading,
    error,
    loadProducts,
    formatPrice,
    isProductAvailable
  } = useProductService()
    
  const [editingProduct, setEditingProduct] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: ''
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  })
  const [confirmationModal, setConfirmationModal] = useState({
    isVisible: false,
    title: '',
    message: '',
    productId: null
  })

  useEffect(() => {
    if (isAdmin()) {
      loadProducts()
      loadCategories()
    }
  }, [isAdmin, loadProducts])

  const loadCategories = async () => {
    try {
      await categoryService.loadCategories()
      setCategories(categoryService.getCategories())
    } catch (error) {
      console.error('Error loading categories:', error)
      showNotification('Error al cargar las categorías', 'error')
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setFormData({
      title: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: ''
    })
    setSelectedImage(null)
    setImagePreview(null)
    setShowAddModal(true)
  }

  const handleEditProduct = (product) => {
    console.log('handleEditProduct called with product:', product)
    setEditingProduct(product)
    setFormData({
      title: product.nombre,
      description: product.descripcion,
      price: product.precio,
      stock: product.stock,
      category_id: product.categoriaId || product.category?.category_id
    })
    setShowEditModal(true)
  }

  const handleDeleteProduct = (productId) => {
    console.log('handleDeleteProduct called with productId:', productId)
    const product = products.find(p => p.id === productId)
    console.log('Found product:', product)
    setConfirmationModal({
      isVisible: true,
      title: 'Eliminar Producto',
      message: `¿Estás seguro de que quieres eliminar "${product?.nombre || 'este producto'}"? Esta acción no se puede deshacer.`,
      productId: productId
    })
  }

  const handleConfirmDelete = async () => {
    console.log('handleConfirmDelete called')
    console.log('confirmationModal:', confirmationModal)
    
    if (!confirmationModal.productId) {
      console.log('No productId in confirmationModal, returning')
      return
    }
    
    try {
      const token = localStorage.getItem('maricafe-token')
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      
      console.log('Sending delete request for product ID:', confirmationModal.productId)
      
      await ProductApiService.deleteProduct(confirmationModal.productId, authHeaders)
      showNotification('Producto eliminado exitosamente', 'success')
      // Reload products after successful deletion
      await loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      showNotification('Error al eliminar el producto: ' + error.message, 'error')
    } finally {
      setConfirmationModal({
        isVisible: false,
        title: '',
        message: '',
        productId: null
      })
    }
  }

  const handleCancelDelete = () => {
    setConfirmationModal({
      isVisible: false,
      title: '',
      message: '',
      productId: null
    })
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingProduct(null)
    setFormData({
      title: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: ''
    })
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setFormData({
      title: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: ''
    })
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSaveProduct = async () => {
    console.log('handleSaveProduct called')
    console.log('editingProduct:', editingProduct)
    console.log('formData:', formData)
    
    if (!editingProduct) {
      console.log('No editing product, returning')
      return
    }
    
    // Validaciones
    if (!formData.title.trim()) {
      showNotification('El título es obligatorio', 'error')
      return
    }
    if (formData.price < 0) {
      showNotification('El precio no puede ser negativo', 'error')
      return
    }
    if (formData.stock < 0) {
      showNotification('El stock no puede ser negativo', 'error')
      return
    }
    
    try {
      setSaving(true)
      const token = localStorage.getItem('maricafe-token')
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: formData.category_id || editingProduct.categoriaId || editingProduct.category?.category_id
      }
      
      console.log('Sending update request with data:', productData)
      console.log('Product ID:', editingProduct.id)
      
      await ProductApiService.updateProduct(editingProduct.id, productData, authHeaders)
      showNotification('Producto actualizado exitosamente', 'success')
      handleCloseEditModal()
      // Reload products after successful update
      await loadProducts()
    } catch (error) {
      console.error('Error updating product:', error)
      showNotification('Error al actualizar el producto: ' + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateProduct = async () => {
    if (!formData.title.trim()) {
      showNotification('El título es obligatorio', 'error')
      return
    }
    if (!formData.category_id) {
      showNotification('Debe seleccionar una categoría', 'error')
      return
    }
    if (formData.price < 0) {
      showNotification('El precio no puede ser negativo', 'error')
      return
    }
    if (formData.stock < 0) {
      showNotification('El stock no puede ser negativo', 'error')
      return
    }
    
    try {
      setSaving(true)
      const token = localStorage.getItem('maricafe-token')
      
      // Create product first
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id)
      }
      
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      
      const response = await ProductApiService.createProduct(productData, authHeaders)
      console.log('Product creation response:', response)
      const createdProduct = response.data || response
      console.log('Extracted product data:', createdProduct)
      
      // Upload image if selected
      if (selectedImage && createdProduct) {
        const productId = createdProduct.product_id || createdProduct.idProduct || createdProduct.id
        console.log('Product created:', createdProduct)
        
        if (productId) {
          const formData = new FormData()
          formData.append('file', selectedImage)
          formData.append('productId', productId)
          
          const imageAuthHeaders = {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type for FormData, let browser set it with boundary
          }
          
          try {
            const uploadResult = await ProductApiService.uploadImage(formData, imageAuthHeaders)
          } catch (uploadError) {
            console.error('Image upload error:', uploadError)
            showNotification('Producto creado pero error al subir imagen: ' + uploadError.message, 'error')
          }
        } else {
          console.error('No product ID found for image upload')
          showNotification('Producto creado pero no se pudo obtener ID para subir imagen', 'error')
        }
      }
      
      showNotification('Producto creado exitosamente', 'success')
      handleCloseAddModal()
      // Reload products after successful creation
      await loadProducts()
    } catch (error) {
      console.error('Error creating product:', error)
      showNotification('Error al crear el producto: ' + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Por favor selecciona un archivo de imagen válido', 'error')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('La imagen debe ser menor a 5MB', 'error')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

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

  // For admins, the backend already returns all products (including zero stock)
  // No need for frontend filtering since the backend handles role-based logic
  const filteredProducts = products

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Productos</h2>
          <Button onClick={handleAddProduct} className="bg-primary text-primary-foreground">
            + Agregar Producto
          </Button>
        </div>
        <p className="text-muted-foreground mb-4">
          Como administrador, puedes ver todos los productos, incluyendo aquellos sin stock.
          El sistema automáticamente muestra todos los productos basado en tu rol de administrador.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{product.nombre}</span>
                {product.stock === 0 && (
                  <Badge variant="destructive">Sin Stock</Badge>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <Badge variant="secondary">Stock Bajo</Badge>
                )}
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
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Categoría: {product.categoria}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Edit button clicked for product:', product)
                        handleEditProduct(product)
                      }}
                    >
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Delete button clicked for product ID:', product.id)
                        handleDeleteProduct(product.id)
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
          <p className="text-muted-foreground">
            No se encontraron productos en el sistema.
          </p>
        </div>
      )}

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Total de Productos:</span> {products.length}
          </div>
          <div>
            <span className="font-medium">Con Stock:</span> {products.filter(p => p.stock > 0).length}
          </div>
          <div>
            <span className="font-medium">Sin Stock:</span> {products.filter(p => p.stock === 0).length}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Producto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea 
                  className="w-full border rounded px-3 py-2"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio *</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                />
              </div>
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
                onClick={handleSaveProduct}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Agregar Producto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ingrese el nombre del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea 
                  className="w-full border rounded px-3 py-2"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="3"
                  placeholder="Ingrese la descripción del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio *</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen del Producto</label>
                <div className="space-y-2">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
                      >
                        <div className="flex flex-col items-center">
                          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Haz clic para seleccionar una imagen</span>
                          <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF hasta 5MB</span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
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
                onClick={handleCreateProduct}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Creando...' : 'Crear Producto'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={4000}
      />

      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        isVisible={confirmationModal.isVisible}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  )
}
