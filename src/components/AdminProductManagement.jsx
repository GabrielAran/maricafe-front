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
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [currentImages, setCurrentImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  })
  const [descriptionError, setDescriptionError] = useState('')
  const [confirmationModal, setConfirmationModal] = useState({
    isVisible: false,
    title: '',
    message: '',
    productId: null,
    action: 'delete',
    product: null
  })

  const [productImages, setProductImages] = useState({})

  useEffect(() => {
    if (isAdmin()) {
      loadProducts()
      loadCategories()
    }
  }, [isAdmin, loadProducts])

  // Load images for all products
  useEffect(() => {
    const loadProductImages = async () => {
      const imagesMap = {}
      for (const product of products) {
        try {
          const images = await ProductApiService.getProductImages(product.id)
          if (images && images.length > 0) {
            imagesMap[product.id] = images[0].url // Store first image URL as primary
          }
        } catch (error) {
          console.error(`Error loading images for product ${product.id}:`, error)
        }
      }
      setProductImages(imagesMap)
    }

    if (products.length > 0) {
      loadProductImages()
    }
  }, [products])

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
    setSelectedImages([])
    setImagePreviews([])
    setShowAddModal(true)
  }

  const handleEditProduct = async (product) => {
    console.log('handleEditProduct called with product:', product)
    if (!product || !product.id) {
      console.error('Invalid product data:', product)
      showNotification('Error: Datos del producto inválidos', 'error')
      return
    }

    setEditingProduct(product)
    setFormData({
      title: product.nombre,
      description: product.descripcion,
      price: product.precio,
      stock: product.stock,
      category_id: product.categoriaId || product.category?.category_id
    })

    setShowEditModal(true) // Show modal immediately
    setCurrentImages([]) // Clear current images while loading

    try {
      // Load the product's current images with actual database IDs
      const images = await ProductApiService.getProductImagesWithIds(product.id)
      console.log('Loaded images with IDs:', images)
      
      if (images && images.length > 0) {
        setCurrentImages(images) // Images now have actual database IDs
      }
    } catch (error) {
      console.error('Error loading product images:', error)
      showNotification('Error al cargar las imágenes del producto', 'error')
      setCurrentImages([])
    }
  }

  const handleDeleteProduct = (product) => {
    console.log('handleDeleteProduct called with product:', product)
    if (!product) {
      return
    }

    const isDeactivate = product.stock >= 1
    const action = isDeactivate ? 'deactivate' : 'delete'
    const actionTitle = isDeactivate ? 'Desactivar Producto' : 'Eliminar Producto'
    const actionMessage = isDeactivate
      ? `El producto "${product?.nombre || 'sin nombre'}" tiene stock disponible. Se desactivará estableciendo su stock en 0.`
      : `¿Estás seguro de que quieres eliminar "${product?.nombre || 'este producto'}"? Esta acción no se puede deshacer.`

    setConfirmationModal({
      isVisible: true,
      title: actionTitle,
      message: actionMessage,
      productId: product.id,
      action,
      product
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
      
      if (confirmationModal.action === 'deactivate') {
        const product = confirmationModal.product
        if (!product) {
          throw new Error('No se pudo obtener la información del producto para desactivarlo.')
        }

        const basePrice = (product.precioOriginal && product.precioOriginal > 0)
          ? product.precioOriginal
          : product.precio

        const numericPrice = Number(basePrice ?? 0)
        if (Number.isNaN(numericPrice)) {
          throw new Error('El precio del producto es inválido.')
        }

        const updatePayload = {
          title: product.nombre,
          description: (product.descripcion || '').slice(0, 120),
          price: numericPrice,
          stock: 0
        }

        if (product.categoriaId !== null && product.categoriaId !== undefined) {
          updatePayload.category_id = product.categoriaId
        }

        console.log('Sending deactivate request for product ID:', product.id, updatePayload)

        await ProductApiService.updateProduct(product.id, updatePayload, authHeaders)
        showNotification('Producto desactivado (stock 0)', 'success')
        await loadProducts()
      } else {
        console.log('Sending delete request for product ID:', confirmationModal.productId)
        
        await ProductApiService.deleteProduct(confirmationModal.productId, authHeaders)
        showNotification('Producto eliminado exitosamente', 'success')
        // Reload products after successful deletion
        await loadProducts()
      }
    } catch (error) {
      const actionLabel = confirmationModal.action === 'deactivate' ? 'desactivar' : 'eliminar'
      console.error(`Error trying to ${actionLabel} product:`, error)
      showNotification(`Error al ${actionLabel} el producto: ${error.message}`, 'error')
      await loadProducts()
    } finally {
      setConfirmationModal({
        isVisible: false,
        title: '',
        message: '',
        productId: null,
        action: 'delete',
        product: null
      })
    }
  }

  const handleCancelDelete = () => {
    setConfirmationModal({
      isVisible: false,
      title: '',
      message: '',
      productId: null,
      action: 'delete',
      product: null
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
    setCurrentImages([])
    setNewImages([])
    setNewImagePreviews([])
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
    setSelectedImages([])
    setImagePreviews([])
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
    // Truncar descripción a 120 chars si es necesario
    if ((formData.description || '').length > 120) {
      const trimmed = (formData.description || '').slice(0, 120)
      setFormData(prev => ({ ...prev, description: trimmed }))
      // mostrar validación inline en el campo (no notificación)
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
        description: (formData.description || '').slice(0, 120),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: formData.category_id || editingProduct.categoriaId || editingProduct.category?.category_id,
        images: currentImages.map(img => img.url)
      }
      
      console.log('Sending update request with data:', productData)
      console.log('Product ID:', editingProduct.id)
      
      await ProductApiService.updateProduct(editingProduct.id, productData, authHeaders)

      // Upload new images if any
      if (newImages.length > 0) {
        const formData = new FormData()
        newImages.forEach(file => {
          formData.append('files', file)
        })
        formData.append('productId', editingProduct.id)
        
        const imageAuthHeaders = {
          'Authorization': `Bearer ${token}`
        }
        
        try {
          const uploadResponse = await ProductApiService.uploadMultipleImages(formData, imageAuthHeaders)
          console.log('Upload response:', uploadResponse)
          
          // Get updated images and set them in state
          const updatedImages = await ProductApiService.getProductImagesWithIds(editingProduct.id)
          if (updatedImages && updatedImages.length > 0) {
            setCurrentImages(updatedImages) // Images already have correct database IDs
          }
        } catch (uploadError) {
          console.error('Error uploading new images:', uploadError)
          showNotification('Error al subir las nuevas imágenes: ' + uploadError.message, 'error')
        }
      }

      showNotification('Producto actualizado exitosamente', 'success')
      
      // Reload products and their images after successful update
      await loadProducts()
      
      // Update the product's images in the state
      if (editingProduct.id) {
        const updatedImages = await ProductApiService.getProductImagesWithIds(editingProduct.id)
        if (updatedImages && updatedImages.length > 0) {
          setProductImages(prev => ({
            ...prev,
            [editingProduct.id]: updatedImages[0].url
          }))
        }
      }
      
      // If no new images were uploaded, we're done
      if (newImages.length === 0) {
        handleCloseEditModal()
      } else {
        // Wait a moment to show the success message before closing if we uploaded images
        setTimeout(() => {
          handleCloseEditModal()
        }, 1500)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      showNotification('Error al actualizar el producto: ' + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Handle deleting an existing image
  const handleDeleteImage = async (imageId) => {
    if (!editingProduct || !editingProduct.id) {
      showNotification('Error: No se puede identificar el producto', 'error')
      return
    }

    try {
      const token = localStorage.getItem('maricafe-token')
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      
      // Delete image with just the image ID
      await ProductApiService.deleteImage(imageId, authHeaders)
      
      // Get updated images after deletion
      const updatedImages = await ProductApiService.getProductImagesWithIds(editingProduct.id)
      if (updatedImages) {
        setCurrentImages(updatedImages) // Images already have correct database IDs
      } else {
        setCurrentImages([])
      }
      
      showNotification('Imagen eliminada exitosamente', 'success')
    } catch (error) {
      console.error('Error deleting image:', error)
      showNotification('Error al eliminar la imagen: ' + error.message, 'error')
    }
  }

  // Handle removing a new image that hasn't been uploaded yet
  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Handler for selecting new images
  const handleNewImageSelect = (event) => {
    const files = Array.from(event.target.files)
    
    if (files.length === 0) return
    
    // Validate total number of images (max 10)
    const totalImages = currentImages.length + newImages.length + files.length
    if (totalImages > 10) {
      showNotification('Máximo 10 imágenes permitidas', 'error')
      return
    }
    
    const validFiles = []
    const validPreviews = []
    
    files.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification(`Archivo ${index + 1} no es una imagen válida`, 'error')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification(`Imagen ${index + 1} debe ser menor a 5MB`, 'error')
        return
      }
      
      validFiles.push(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        validPreviews.push(e.target.result)
        if (validPreviews.length === validFiles.length) {
          setNewImages(prev => [...prev, ...validFiles])
          setNewImagePreviews(prev => [...prev, ...validPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCreateProduct = async () => {
    if (!formData.title.trim()) {
      showNotification('El título es obligatorio', 'error')
      return
    }
    // Truncar descripción a 120 chars si es necesario
    if ((formData.description || '').length > 120) {
      const trimmed = (formData.description || '').slice(0, 120)
      setFormData(prev => ({ ...prev, description: trimmed }))
      // mostrar validación inline en el campo (no notificación)
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
        description: (formData.description || '').slice(0, 120),
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
      
      // Upload images if selected
      if (selectedImages.length > 0 && createdProduct) {
        const productId = createdProduct.product_id || createdProduct.idProduct || createdProduct.id
        console.log('Product created:', createdProduct)
        
        if (productId) {
          const formData = new FormData()
          selectedImages.forEach((file, index) => {
            formData.append('files', file)
          })
          formData.append('productId', productId)
          
          const imageAuthHeaders = {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type for FormData, let browser set it with boundary
          }
          
          try {
            const uploadResult = await ProductApiService.uploadMultipleImages(formData, imageAuthHeaders)
            console.log('Images uploaded successfully:', uploadResult)
          } catch (uploadError) {
            console.error('Images upload error:', uploadError)
            showNotification('Producto creado pero error al subir imágenes: ' + uploadError.message, 'error')
          }
        } else {
          console.error('No product ID found for image upload')
          showNotification('Producto creado pero no se pudo obtener ID para subir imágenes', 'error')
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
    // If updating description, enforce 120 char limit and set inline error when limit reached
    if (field === 'description') {
      const trimmed = value.slice(0, 120)
      setFormData(prev => ({ ...prev, [field]: trimmed }))
      if (value.length >= 120) {
        setDescriptionError('La descripción no puede exceder 120 caracteres')
      } else {
        setDescriptionError('')
      }
      return
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files)
    
    if (files.length === 0) return
    
    // Validate total number of images (max 10)
    if (selectedImages.length + files.length > 10) {
      showNotification('Máximo 10 imágenes permitidas', 'error')
      return
    }
    
    const validFiles = []
    const validPreviews = []
    
    files.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification(`Archivo ${index + 1} no es una imagen válida`, 'error')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification(`Imagen ${index + 1} debe ser menor a 5MB`, 'error')
        return
      }
      
      validFiles.push(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        validPreviews.push(e.target.result)
        if (validPreviews.length === validFiles.length) {
          setSelectedImages(prev => [...prev, ...validFiles])
          setImagePreviews(prev => [...prev, ...validPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
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
          Crea, edita y elimina productos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="relative">
            <CardHeader>
              <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-t-lg overflow-hidden">
                {productImages[product.id] ? (
                  <img
                    src={productImages[product.id]}
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image for product:', product.id)
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48L3N2Zz4=' // Placeholder SVG
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <CardTitle className="flex items-start justify-between gap-3">
                {/* Allow product names to wrap to multiple lines and prevent
                    clipping by giving a max width and enabling word breaks. */}
                <span className="max-w-[65%] break-words text-lg">
                  {product.nombre}
                </span>
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  {product.stock === 0 && (
                    <Badge variant="destructive">Sin Stock</Badge>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <Badge variant="secondary">Stock Bajo</Badge>
                  )}
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
                        handleDeleteProduct(product)
                      }}
                    >
                      {product.stock >= 1 ? 'Desactivar' : 'Eliminar'}
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
                  onChange={(e) => handleInputChange('description', e.target.value.slice(0,120))}
                  rows="3"
                  maxLength={120}
                />
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-muted-foreground">{formData.description.length}/120</div>
                  {descriptionError && (
                    <div className="text-xs text-red-600 ml-2">{descriptionError}</div>
                  )}
                </div>
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

              {/* Images Section */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imágenes del Producto ({currentImages.length + newImages.length}/10)
                </label>
                
                {/* Current Images */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Imágenes actuales:</p>
                  {currentImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {currentImages.map((image, index) => {
                        console.log('Rendering image:', image)
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={image.url}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                              onError={(e) => {
                                console.error('Error loading image:', image)
                                e.target.onerror = null // Prevent infinite loop
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48L3N2Zz4=' // Inline SVG placeholder
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg">
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(image.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic text-center p-4 border-2 border-dashed border-gray-200 rounded-lg">
                      No hay imágenes cargadas
                    </div>
                  )}
                </div>

                {/* New Images */}
                {newImagePreviews.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Imágenes nuevas:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {newImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Nueva imagen ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Images Button */}
                {currentImages.length + newImages.length < 10 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleNewImageSelect}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label
                      htmlFor="edit-image-upload"
                      className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
                    >
                      <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Haz clic para agregar imágenes</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF hasta 5MB cada una</span>
                      </div>
                    </label>
                  </div>
                )}
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
                  onChange={(e) => handleInputChange('description', e.target.value.slice(0,120))}
                  rows="3"
                  maxLength={120}
                  placeholder="Ingrese la descripción del producto"
                />
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-muted-foreground">{formData.description.length}/120</div>
                  {descriptionError && (
                    <div className="text-xs text-red-600 ml-2">{descriptionError}</div>
                  )}
                </div>
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
                <label className="block text-sm font-medium mb-1">
                  Imágenes del Producto ({selectedImages.length}/10)
                </label>
                <div className="space-y-2">
                  {imagePreviews.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
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
                          <span>Haz clic para seleccionar imágenes</span>
                          <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF hasta 5MB cada una</span>
                          <span className="text-xs text-gray-500">Máximo 10 imágenes (la primera será la principal)</span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {index === 0 ? 'Principal' : index + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      {selectedImages.length < 10 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            id="add-more-images"
                          />
                          <label
                            htmlFor="add-more-images"
                            className="cursor-pointer text-xs text-gray-600 hover:text-gray-800"
                          >
                            + Agregar más imágenes
                          </label>
                        </div>
                      )}
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
        confirmText={confirmationModal.action === 'deactivate' ? 'Desactivar' : 'Eliminar'}
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  )
}
