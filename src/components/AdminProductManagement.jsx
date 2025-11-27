import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, X } from 'lucide-react'
import { fetchCategories, selectCategoryCategories } from '../redux/slices/category.slice.js'
import { fetchProducts, createProduct, updateProduct, deleteProduct, activateProduct } from '../redux/slices/product.slice.js'
import { fetchProductImages, fetchProductImagesWithIds, createMultipleImages, deleteImage } from '../redux/slices/images.slice.js'
import { selectIsAdmin } from '../redux/slices/user.slice.js'
import { formatPrice } from '../utils/priceHelpers.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Badge from './ui/Badge.jsx'
import Notification from './ui/Notification.jsx'
import ConfirmationModal from './ui/ConfirmationModal.jsx'

export default function AdminProductManagement() {
  const dispatch = useDispatch()
  const categoryItems = useSelector(selectCategoryCategories)
  const products = useSelector(state => state.products.products)
  const productsState = useSelector(state => state.products)
  const imagesState = useSelector(state => state.images)
  const loading = productsState.pending
  const error = productsState.error
  const isAdminUser = useSelector(selectIsAdmin)

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
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    images: ''
  })
  const [confirmationModal, setConfirmationModal] = useState({
    isVisible: false,
    title: '',
    message: '',
    productId: null,
    action: 'delete',
    product: null
  })

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const thumbnailsByProductId = useSelector(state => state.images.thumbnailsByProductId || {})
  const imagesByProductId = useSelector(state => state.images.imagesByProductId || {})
  const hasInitialized = useRef(false)

  const [lastAction, setLastAction] = useState(null) // 'create' | 'update' | 'delete' | 'activate'
  const [lastProductId, setLastProductId] = useState(null)
  const [createDraft, setCreateDraft] = useState(null)

  const [lastImageAction, setLastImageAction] = useState(null) // 'loadEditImages' | 'uploadForCreated' | 'uploadForUpdated' | 'deleteImage'
  const [lastImageProductId, setLastImageProductId] = useState(null)

  const prevProductsPending = useRef(false)
  const prevImagesPending = useRef(false)
  
  // Simple tracking: which product IDs we've already requested images for
  const requestedProductIdsRef = useRef(new Set())

  useEffect(() => {
    if (!hasInitialized.current && isAdminUser) {
      hasInitialized.current = true
      dispatch(fetchProducts())
      dispatch(fetchCategories())
    }
  }, [isAdminUser, dispatch])

  useEffect(() => {
    setCategories(
      categoryItems.map((c) => ({
        id: c.category_id,
        name: c.name,
      })),
    )
  }, [categoryItems])

  // Simple image fetching: fetch images for products that don't have them yet
  // Each product's images are fetched once and cached in Redux
  useEffect(() => {
    if (!products || products.length === 0) return

    products.forEach((product) => {
      const productId = product?.id
      if (!productId) return

      // Check if we already have images for this product
      const hasThumbnail = thumbnailsByProductId[productId]
      const hasImages = imagesByProductId[productId] && Array.isArray(imagesByProductId[productId]) && imagesByProductId[productId].length > 0
      
      // If we have images, we're done
      if (hasThumbnail || hasImages) {
        // Clean up tracking if it was there
        requestedProductIdsRef.current.delete(productId)
        return
      }

      // If we've already requested images for this product, skip
      if (requestedProductIdsRef.current.has(productId)) return

      // Mark as requested and fetch
      requestedProductIdsRef.current.add(productId)
      dispatch(fetchProductImages(productId))
    })
  }, [products, thumbnailsByProductId, imagesByProductId, dispatch])


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
    setFormErrors({
      title: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      images: ''
    })
    setShowAddModal(true)
  }

  const handleEditProduct = (product) => {
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
      // Usar siempre el precio original como base de edición para evitar doble descuento
      price: product.precioOriginal ?? product.precio,
      stock: product.stock,
      category_id: product.categoriaId || product.category?.category_id
    })

    setShowEditModal(true) // Show modal immediately
    setCurrentImages([]) // Clear current images while loading

    // Load the product's current images with actual database IDs
    setLastImageAction('loadEditImages')
    setLastImageProductId(product.id)
    dispatch(fetchProductImagesWithIds(product.id))
  }

  const handleDeleteProduct = (product) => {
    console.log('handleDeleteProduct called with product:', product)
    if (!product) {
      return
    }

    const isCurrentlyActive = product.active !== false
    const action = isCurrentlyActive ? 'deactivate' : 'activate'
    const actionTitle = isCurrentlyActive ? 'Desactivar Producto' : 'Activar Producto'
    const actionMessage = isCurrentlyActive
      ? `El producto "${product?.nombre || 'sin nombre'}" se desactivará y dejará de mostrarse en la tienda, pero se mantendrá para fines administrativos.`
      : `El producto "${product?.nombre || 'sin nombre'}" se activará y volverá a mostrarse en la tienda para los usuarios.`

    setConfirmationModal({
      isVisible: true,
      title: actionTitle,
      message: actionMessage,
      productId: product.id,
      action,
      product
    })
  }

  const handleConfirmDelete = () => {
    console.log('handleConfirmDelete called')
    console.log('confirmationModal:', confirmationModal)

    if (!confirmationModal.productId || !confirmationModal.product) {
      console.log('No productId in confirmationModal, returning')
      return
    }

    const { action, product } = confirmationModal

    if (action === 'deactivate') {
      console.log('Sending soft delete (deactivate) request for product ID:', confirmationModal.productId)

      setLastAction('delete')
      setLastProductId(confirmationModal.productId)
      dispatch(deleteProduct(confirmationModal.productId))
    } else if (action === 'activate') {
      console.log('Sending activate request for product ID:', confirmationModal.productId)

      setLastAction('activate')
      setLastProductId(confirmationModal.productId)
      dispatch(activateProduct(confirmationModal.productId))
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
    setFormErrors({
      title: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      images: ''
    })
  }

  const handleSaveProduct = () => {
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

    setSaving(true)

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

    setLastAction('update')
    setLastProductId(editingProduct.id)
    dispatch(updateProduct({ productId: editingProduct.id, data: productData }))

    if (newImages.length > 0) {
      setLastImageAction('uploadForUpdated')
      setLastImageProductId(editingProduct.id)
      dispatch(createMultipleImages({ files: newImages, productId: editingProduct.id }))
    }
  }

  // Handle deleting an existing image
  const handleDeleteImage = (imageId) => {
    if (!editingProduct || !editingProduct.id) {
      showNotification('Error: No se puede identificar el producto', 'error')
      return
    }

    // Delete image with just the image ID
    setLastImageAction('deleteImage')
    setLastImageProductId(editingProduct.id)
    dispatch(deleteImage(imageId))
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

  const handleCreateProduct = () => {
    const errors = {
      title: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      images: ''
    }

    // Validaciones de campos obligatorios
    if (!formData.title.trim()) {
      errors.title = 'El nombre es obligatorio'
    }

    if (!formData.description || !formData.description.trim()) {
      errors.description = 'La descripción es obligatoria'
    }

    // Truncar descripción a 120 chars si es necesario
    if ((formData.description || '').length > 120) {
      const trimmed = (formData.description || '').slice(0, 120)
      setFormData(prev => ({ ...prev, description: trimmed }))
      // mostrar validación inline en el campo (no notificación)
    }

    if (!formData.category_id) {
      errors.category_id = 'Debe seleccionar una categoría'
    }

    const numericPrice = parseFloat(formData.price)
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      errors.price = 'El precio es obligatorio y debe ser mayor a 0'
    }

    const numericStock = parseInt(formData.stock)
    if (Number.isNaN(numericStock) || numericStock <= 0) {
      errors.stock = 'El stock es obligatorio y debe ser mayor a 0'
    }

    if (selectedImages.length === 0) {
      errors.images = 'Debe cargar al menos una imagen para el producto'
    }

    // Si hay al menos un error, mostrar notificación y no continuar
    const hasErrors = Object.values(errors).some(msg => msg)
    if (hasErrors) {
      setFormErrors(errors)

      // Mantener también el cartel general (toast) para feedback rápido
      showNotification('Por favor complete los campos obligatorios marcados en rojo', 'error')
      return
    }

    // Limpiar errores si todo está OK
    setFormErrors({
      title: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      images: ''
    })

    setSaving(true)

    // Create product first
    const productData = {
      title: formData.title,
      description: (formData.description || '').slice(0, 120),
      price: numericPrice,
      stock: numericStock,
      category_id: parseInt(formData.category_id)
    }

    setCreateDraft({
      title: productData.title,
      description: productData.description,
      categoryId: productData.category_id,
      price: productData.price,
      stock: productData.stock,
    })

    setLastAction('create')
    setLastProductId(null)
    dispatch(createProduct(productData))
  }

  useEffect(() => {
    const { pending, error: productsError } = productsState
    const wasPending = prevProductsPending.current

    if (wasPending && !pending && lastAction) {
      if (lastAction === 'delete') {
        if (!productsError) {
          showNotification('Producto desactivado exitosamente', 'success')
        } else {
          showNotification(`Error al desactivar el producto: ${productsError}`, 'error')
        }
        setConfirmationModal({
          isVisible: false,
          title: '',
          message: '',
          productId: null,
          action: 'delete',
          product: null
        })
        setLastAction(null)
        setLastProductId(null)
      }

      if (lastAction === 'activate') {
        if (!productsError) {
          showNotification('Producto activado exitosamente', 'success')
        } else {
          showNotification('Error al activar el producto: ' + productsError, 'error')
        }
        setConfirmationModal({
          isVisible: false,
          title: '',
          message: '',
          productId: null,
          action: 'delete',
          product: null
        })
        setLastAction(null)
        setLastProductId(null)
      }

      if (lastAction === 'update') {
        if (!productsError) {
          showNotification('Producto actualizado exitosamente', 'success')
          handleCloseEditModal()
          setSaving(false)
        } else {
          showNotification('Error al actualizar el producto: ' + productsError, 'error')
          setSaving(false)
        }
        // Always clear confirmation modal after update (covers activate flow)
        setConfirmationModal({
          isVisible: false,
          title: '',
          message: '',
          productId: null,
          action: 'delete',
          product: null
        })
        setLastAction(null)
        setLastProductId(null)
      }

      if (lastAction === 'create') {
        if (!productsError) {
          let createdProduct = null
          if (createDraft) {
            createdProduct = products.find(p =>
              p.nombre === createDraft.title &&
              p.descripcion === createDraft.description &&
              (p.categoriaId === createDraft.categoryId || String(p.categoriaId) === String(createDraft.categoryId))
            )
          }

          showNotification('Producto creado exitosamente', 'success')
          handleCloseAddModal()
          setSaving(false)

          if (createdProduct && selectedImages.length > 0) {
            setLastImageAction('uploadForCreated')
            setLastImageProductId(createdProduct.id)
            dispatch(createMultipleImages({ files: selectedImages, productId: createdProduct.id }))
          }
        } else {
          showNotification('Error al crear el producto: ' + productsError, 'error')
          setSaving(false)
        }

        setLastAction(null)
        setLastProductId(null)
        setCreateDraft(null)
      }
    }

    prevProductsPending.current = pending
  }, [productsState.pending, productsState.error, lastAction, lastProductId, products, createDraft, selectedImages, dispatch])

  useEffect(() => {
    const { pending, error: imagesError, imagesByProductId } = imagesState
    const wasPending = prevImagesPending.current

    if (wasPending && !pending && lastImageAction) {
      if (lastImageAction === 'loadEditImages') {
        const productImages =
          lastImageProductId != null && imagesByProductId
            ? imagesByProductId[lastImageProductId] || []
            : []

        if (!imagesError && Array.isArray(productImages)) {
          const mapped = productImages.map(imageResponse => {
            if (!imageResponse || !imageResponse.id || !imageResponse.file) return null
            const cleanBase64 = imageResponse.file.toString()
              .replace(/\s/g, '')
              .replace(/^data:image\/[a-z]+;base64,/, '')
            return {
              id: imageResponse.id,
              url: `data:image/png;base64,${cleanBase64}`,
            }
          }).filter(Boolean)
          setCurrentImages(mapped || [])
        } else if (imagesError) {
          showNotification('Error al cargar las imágenes del producto', 'error')
          setCurrentImages([])
        }
        setLastImageAction(null)
        setLastImageProductId(null)
      }

      if (lastImageAction === 'uploadForUpdated' && lastImageProductId) {
        if (imagesError) {
          showNotification('Error al subir las nuevas imágenes: ' + imagesError, 'error')
        } else {
          // Only fetch with IDs since we need them for the edit modal
          dispatch(fetchProductImagesWithIds(lastImageProductId))
        }
        setLastImageAction(null)
        setLastImageProductId(null)
        setNewImages([])
        setNewImagePreviews([])
      }

      if (lastImageAction === 'uploadForCreated' && lastImageProductId) {
        if (imagesError) {
          showNotification('Producto creado pero error al subir imágenes: ' + imagesError, 'error')
        } else {
          // Fetch images to update the cache and display thumbnails
          // Remove from tracking so it can be fetched fresh
          requestedProductIdsRef.current.delete(lastImageProductId)
          dispatch(fetchProductImages(lastImageProductId))
        }
        setLastImageAction(null)
        setLastImageProductId(null)
        setSelectedImages([])
        setImagePreviews([])
      }

      if (lastImageAction === 'deleteImage' && lastImageProductId) {
        if (!imagesError) {
          // Refetch with IDs to update the edit modal, and also fetch regular images to update thumbnails
          dispatch(fetchProductImagesWithIds(lastImageProductId))
          // Also update the thumbnail cache
          dispatch(fetchProductImages(lastImageProductId))
          showNotification('Imagen eliminada exitosamente', 'success')
        } else {
          showNotification('Error al eliminar la imagen: ' + imagesError, 'error')
        }
        setLastImageAction(null)
        setLastImageProductId(null)
      }
    }

    prevImagesPending.current = pending
  }, [imagesState.pending, imagesState.error, imagesState.imagesByProductId, lastImageAction, lastImageProductId, dispatch])

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
      // Limpiar error de descripción si el usuario empieza a escribir
      setFormErrors(prev => ({ ...prev, description: '' }))
      return
    }

    // Limitar el precio a máximo dos decimales
    if (field === 'price') {
      if (typeof value === 'string') {
        // Reemplazar coma por punto para decimal
        let normalized = value.replace(',', '.')

        // Eliminar caracteres que no sean dígitos o punto
        normalized = normalized.replace(/[^0-9.]/g, '')

        // Si hay más de un punto, conservar solo el primero
        const parts = normalized.split('.')
        if (parts.length > 2) {
          normalized = parts[0] + '.' + parts.slice(1).join('')
        }

        const [intPart, decPartRaw] = normalized.split('.')
        if (decPartRaw !== undefined) {
          const decPart = decPartRaw.slice(0, 2)
          normalized = decPart.length > 0 ? `${intPart}.${decPart}` : intPart
        }

        value = normalized
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpiar error específico del campo cuando el usuario lo modifica
    setFormErrors(prev => ({
      ...prev,
      [field]: ''
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

  if (!isAdminUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Acceso Denegado</h2>
          <p className="text-muted-foreground">Solo los administradores pueden acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  // Only show loading screen on initial load (when products array is empty)
  // Don't show loading during create/update/delete operations to avoid "refresh" appearance
  if (loading && products.length === 0) {
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
  // Filter products based on search term and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        (product.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())

      // Category filter
      const matchesCategory = categoryFilter === 'all' ||
        String(product.categoriaId || product.category?.category_id) === String(categoryFilter)

      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

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

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="w-full md:w-64">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="relative">
            <CardHeader>
              <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-t-lg overflow-hidden">
                {thumbnailsByProductId[product.id] ? (
                  <img
                    src={thumbnailsByProductId[product.id]}
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
                  <div className="flex flex-col">
                    {product.descuento > 0 && product.precioOriginal > product.precio && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.precioOriginal)}
                        </span>
                        <Badge variant="destructive">{product.descuento}% OFF</Badge>
                      </div>
                    )}
                    <span className="text-lg font-semibold">
                      {formatPrice(product.precio)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Categoría: {product.categoria}
                  </span>
                  <div className="flex gap-1">
                    {!product.active && (
                      <Badge variant="outline">Inactivo</Badge>
                    )}
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
                      variant={product.active === false ? 'default' : 'destructive'}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProduct(product)
                      }}
                    >
                      {product.active === false ? 'Activar' : 'Desactivar'}
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Editar Producto</h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
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
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value.slice(0, 120))}
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
                  Imágenes del Producto * ({currentImages.length + newImages.length}/10)
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

            <div className="flex gap-2 mt-6 pt-2 border-t border-gray-100">
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Agregar Producto</h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  className={`w-full border rounded px-3 py-2 ${formErrors.title ? 'border-red-500' : ''}`}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ingrese el nombre del producto"
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <textarea
                  className={`w-full border rounded px-3 py-2 ${formErrors.description ? 'border-red-500' : ''}`}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value.slice(0, 120))}
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
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                  className={`w-full border rounded px-3 py-2 ${formErrors.category_id ? 'border-red-500' : ''}`}
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
                {formErrors.category_id && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.category_id}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`w-full border rounded px-3 py-2 ${formErrors.price ? 'border-red-500' : ''}`}
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                />
                {formErrors.price && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input
                  type="number"
                  min="0"
                  className={`w-full border rounded px-3 py-2 ${formErrors.stock ? 'border-red-500' : ''}`}
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="0"
                />
                {formErrors.stock && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.stock}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Imágenes del Producto * ({selectedImages.length}/10)
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
                {formErrors.images && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.images}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6 pt-2 border-t border-gray-100">
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
        confirmText={
          confirmationModal.action === 'deactivate'
            ? 'Desactivar'
            : confirmationModal.action === 'activate'
              ? 'Activar'
              : 'Confirmar'
        }
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  )
}
