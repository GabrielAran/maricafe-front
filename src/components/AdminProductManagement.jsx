import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, selectCategoryCategories } from '../redux/slices/category.slice.js'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../redux/slices/product.slice.js'
import { fetchProductImages, fetchProductImagesWithIds, createMultipleImages, deleteImage } from '../redux/slices/images.slice.js'
import { selectIsAdmin } from '../redux/slices/user.slice.js'
import { formatPrice, isProductAvailable } from '../utils/productHelpers.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Badge from './ui/Badge.jsx'
import Notification from './ui/Notification.jsx'
import ConfirmationModal from './ui/ConfirmationModal.jsx'

export default function AdminProductManagement() {
  const { isAdmin } = useAuth()
  const dispatch = useDispatch()
  const categoryItems = useSelector(selectCategoryCategories)
  const products = useSelector(state => state.products.products)
  const loading = useSelector(state => state.products.pending)
  const error = useSelector(state => state.products.error)
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
  const [confirmationModal, setConfirmationModal] = useState({
    isVisible: false,
    title: '',
    message: '',
    productId: null,
    action: 'delete',
    product: null
  })

  const [productImages, setProductImages] = useState({})
  const hasInitialized = useRef(false)

  /**
   * FIX: Prevent duplicate dispatch calls to fetchProducts()
   * 
   * Problem: 
   * 1. React StrictMode in development intentionally double-invokes effects
   * 2. The original dependency array included `isAdmin` (a function reference)
   *    which could change between renders, causing the effect to re-run
   * 
   * Solution: 
   * - Use a ref to track initialization status (prevents duplicate calls even with StrictMode)
   * - Use Redux selector `selectIsAdmin` instead of function call for stable dependency
   * - This ensures only one fetch call per component lifecycle
   */
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

  // Load images for all products
  useEffect(() => {
    if (products.length > 0) {
      products.forEach(product => {
        dispatch(fetchProductImages(product.id)).then((result) => {
          if (result.type === 'images/fetchProductImages/fulfilled' && result.payload && result.payload.length > 0) {
            // Process base64 images from Redux response
            const firstImage = result.payload[0]
            let imageUrl = null
            if (typeof firstImage === 'string') {
              const cleanBase64 = firstImage.replace(/\s/g, '').replace(/^data:image\/[a-z]+;base64,/, '')
              imageUrl = `data:image/png;base64,${cleanBase64}`
            }
            if (imageUrl) {
              setProductImages(prev => ({
                ...prev,
                [product.id]: imageUrl
              }))
            }
          }
        })
      })
    }
  }, [products, dispatch])


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
      price: product.precio,
      stock: product.stock,
      category_id: product.categoriaId || product.category?.category_id
    })

    setShowEditModal(true) // Show modal immediately
    setCurrentImages([]) // Clear current images while loading

    // Load the product's current images with actual database IDs
    dispatch(fetchProductImagesWithIds(product.id)).then((result) => {
      if (result.type === 'images/fetchProductImagesWithIds/fulfilled' && result.payload) {
        const images = result.payload.map((imageResponse) => {
          if (!imageResponse || !imageResponse.id || !imageResponse.file) {
            return null
          }
          const cleanBase64 = imageResponse.file.toString()
            .replace(/\s/g, '')
            .replace(/^data:image\/[a-z]+;base64,/, '')
          return {
            id: imageResponse.id,
            url: `data:image/png;base64,${cleanBase64}`
          }
        }).filter(Boolean)
        console.log('Loaded images with IDs:', images)
        if (images && images.length > 0) {
          setCurrentImages(images) // Images now have actual database IDs
        }
      } else if (result.type === 'images/fetchProductImagesWithIds/rejected') {
        console.error('Error loading product images:', result.error)
        showNotification('Error al cargar las imágenes del producto', 'error')
        setCurrentImages([])
      }
    })
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

  const handleConfirmDelete = () => {
    console.log('handleConfirmDelete called')
    console.log('confirmationModal:', confirmationModal)

    if (!confirmationModal.productId) {
      console.log('No productId in confirmationModal, returning')
      return
    }

    if (confirmationModal.action === 'deactivate') {
      const product = confirmationModal.product
      if (!product) {
        showNotification('No se pudo obtener la información del producto para desactivarlo.', 'error')
        setConfirmationModal({
          isVisible: false,
          title: '',
          message: '',
          productId: null,
          action: 'delete',
          product: null
        })
        return
      }

      const basePrice = (product.precioOriginal && product.precioOriginal > 0)
        ? product.precioOriginal
        : product.precio

      const numericPrice = Number(basePrice ?? 0)
      if (Number.isNaN(numericPrice)) {
        showNotification('El precio del producto es inválido.', 'error')
        setConfirmationModal({
          isVisible: false,
          title: '',
          message: '',
          productId: null,
          action: 'delete',
          product: null
        })
        return
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

      dispatch(updateProduct({ productId: product.id, data: updatePayload })).then((result) => {
        if (result.type === 'products/updateProduct/fulfilled') {
          showNotification('Producto desactivado (stock 0)', 'success')
          // Redux state is automatically updated by the slice
        } else if (result.type === 'products/updateProduct/rejected') {
          showNotification(`Error al desactivar el producto: ${result.error.message}`, 'error')
        }
        setConfirmationModal({
          isVisible: false,
          title: '',
          message: '',
          productId: null,
          action: 'delete',
          product: null
        })
      })
    } else {
      console.log('Sending delete request for product ID:', confirmationModal.productId)

      dispatch(deleteProduct(confirmationModal.productId)).then((result) => {
        if (result.type === 'products/deleteProduct/fulfilled') {
          showNotification('Producto eliminado exitosamente', 'success')
          // Remove product image from local state
          setProductImages(prev => {
            const updated = { ...prev }
            delete updated[confirmationModal.productId]
            return updated
          })
          // Redux state is automatically updated by the slice
        } else if (result.type === 'products/deleteProduct/rejected') {
          showNotification(`Error al eliminar el producto: ${result.error.message}`, 'error')
        }
        setConfirmationModal({
          isVisible: false,
          title: '',
          message: '',
          productId: null,
          action: 'delete',
          product: null
        })
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

    dispatch(updateProduct({ productId: editingProduct.id, data: productData })).then((updateResult) => {
      if (updateResult.type === 'products/updateProduct/fulfilled') {
        // Upload new images if any
        if (newImages.length > 0) {
          dispatch(createMultipleImages({ files: newImages, productId: editingProduct.id })).then((uploadResult) => {
            if (uploadResult.type === 'images/createMultipleImages/fulfilled') {
              console.log('Upload response:', uploadResult.payload)
              // Get updated images and set them in state
              dispatch(fetchProductImagesWithIds(editingProduct.id)).then((imagesResult) => {
                if (imagesResult.type === 'images/fetchProductImagesWithIds/fulfilled' && imagesResult.payload) {
                  const updatedImages = imagesResult.payload.map((imageResponse) => {
                    if (!imageResponse || !imageResponse.id || !imageResponse.file) {
                      return null
                    }
                    const cleanBase64 = imageResponse.file.toString()
                      .replace(/\s/g, '')
                      .replace(/^data:image\/[a-z]+;base64,/, '')
                    return {
                      id: imageResponse.id,
                      url: `data:image/png;base64,${cleanBase64}`
                    }
                  }).filter(Boolean)
                  if (updatedImages && updatedImages.length > 0) {
                    setCurrentImages(updatedImages)
                  }
                }
              })
            } else if (uploadResult.type === 'images/createMultipleImages/rejected') {
              console.error('Error uploading new images:', uploadResult.error)
              showNotification('Error al subir las nuevas imágenes: ' + uploadResult.error.message, 'error')
            }
          })
        }

        showNotification('Producto actualizado exitosamente', 'success')

        // Update the product's thumbnail image in local state if needed
        if (editingProduct.id && (newImages.length > 0 || currentImages.length > 0)) {
          // Fetch updated images to update thumbnail
          dispatch(fetchProductImages(editingProduct.id)).then((imagesResult) => {
            if (imagesResult.type === 'images/fetchProductImages/fulfilled' && imagesResult.payload && imagesResult.payload.length > 0) {
              const firstImage = imagesResult.payload[0]
              let imageUrl = null
              if (typeof firstImage === 'string') {
                const cleanBase64 = firstImage.replace(/\s/g, '').replace(/^data:image\/[a-z]+;base64,/, '')
                imageUrl = `data:image/png;base64,${cleanBase64}`
              }
              if (imageUrl) {
                setProductImages(prev => ({
                  ...prev,
                  [editingProduct.id]: imageUrl
                }))
              }
            }
          })
        }
        // Redux state is automatically updated by the slice - no need to refetch all products

        // If no new images were uploaded, we're done
        if (newImages.length === 0) {
          handleCloseEditModal()
          setSaving(false)
        } else {
          // Wait a moment to show the success message before closing if we uploaded images
          setTimeout(() => {
            handleCloseEditModal()
            setSaving(false)
          }, 1500)
        }
      } else if (updateResult.type === 'products/updateProduct/rejected') {
        console.error('Error updating product:', updateResult.error)
        showNotification('Error al actualizar el producto: ' + updateResult.error.message, 'error')
        setSaving(false)
      }
    })
  }

  // Handle deleting an existing image
  const handleDeleteImage = (imageId) => {
    if (!editingProduct || !editingProduct.id) {
      showNotification('Error: No se puede identificar el producto', 'error')
      return
    }

    // Delete image with just the image ID
    dispatch(deleteImage(imageId)).then((result) => {
      if (result.type === 'images/deleteImage/fulfilled') {
        // Get updated images after deletion
        dispatch(fetchProductImagesWithIds(editingProduct.id)).then((imagesResult) => {
          if (imagesResult.type === 'images/fetchProductImagesWithIds/fulfilled' && imagesResult.payload) {
            const updatedImages = imagesResult.payload.map((imageResponse) => {
              if (!imageResponse || !imageResponse.id || !imageResponse.file) {
                return null
              }
              const cleanBase64 = imageResponse.file.toString()
                .replace(/\s/g, '')
                .replace(/^data:image\/[a-z]+;base64,/, '')
              return {
                id: imageResponse.id,
                url: `data:image/png;base64,${cleanBase64}`
              }
            }).filter(Boolean)
            if (updatedImages) {
              setCurrentImages(updatedImages) // Images already have correct database IDs
            } else {
              setCurrentImages([])
            }
          } else {
            setCurrentImages([])
          }
        })
        showNotification('Imagen eliminada exitosamente', 'success')
      } else if (result.type === 'images/deleteImage/rejected') {
        console.error('Error deleting image:', result.error)
        showNotification('Error al eliminar la imagen: ' + result.error.message, 'error')
      }
    })
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

    setSaving(true)

    // Create product first
    const productData = {
      title: formData.title,
      description: (formData.description || '').slice(0, 120),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category_id: parseInt(formData.category_id)
    }

    dispatch(createProduct(productData)).then((result) => {
      if (result.type === 'products/createProduct/fulfilled') {
        const apiResponse = result.payload
        const createdProduct = apiResponse?.data || apiResponse
        console.log('Product creation response:', apiResponse)
        console.log('Extracted product data:', createdProduct)

        // Upload images if selected
        if (selectedImages.length > 0 && createdProduct) {
          const productId = createdProduct.product_id || createdProduct.idProduct || createdProduct.id
          console.log('Product created:', createdProduct)

          if (productId) {
            dispatch(createMultipleImages({ files: selectedImages, productId })).then((uploadResult) => {
              if (uploadResult.type === 'images/createMultipleImages/fulfilled') {
                console.log('Images uploaded successfully:', uploadResult.payload)
              } else if (uploadResult.type === 'images/createMultipleImages/rejected') {
                console.error('Images upload error:', uploadResult.error)
                showNotification('Producto creado pero error al subir imágenes: ' + uploadResult.error.message, 'error')
              }
            })
          } else {
            console.error('No product ID found for image upload')
            showNotification('Producto creado pero no se pudo obtener ID para subir imágenes', 'error')
          }
        }

        showNotification('Producto creado exitosamente', 'success')
        handleCloseAddModal()
        // Redux state is automatically updated by the slice - no need to refetch all products
        // Fetch image for the new product to display thumbnail
        if (createdProduct) {
          const productId = createdProduct.product_id || createdProduct.idProduct || createdProduct.id
          if (productId && selectedImages.length > 0) {
            // Wait a bit for images to be processed, then fetch the first image
            setTimeout(() => {
              dispatch(fetchProductImages(productId)).then((imagesResult) => {
                if (imagesResult.type === 'images/fetchProductImages/fulfilled' && imagesResult.payload && imagesResult.payload.length > 0) {
                  const firstImage = imagesResult.payload[0]
                  let imageUrl = null
                  if (typeof firstImage === 'string') {
                    const cleanBase64 = firstImage.replace(/\s/g, '').replace(/^data:image\/[a-z]+;base64,/, '')
                    imageUrl = `data:image/png;base64,${cleanBase64}`
                  }
                  if (imageUrl) {
                    setProductImages(prev => ({
                      ...prev,
                      [productId]: imageUrl
                    }))
                  }
                }
              })
            }, 500)
          }
        }
        setSaving(false)
      } else if (result.type === 'products/createProduct/rejected') {
        console.error('Error creating product:', result.error)
        showNotification('Error al crear el producto: ' + result.error.message, 'error')
        setSaving(false)
      }
    })
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
