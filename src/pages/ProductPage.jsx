import React, { useState, useEffect } from 'react'
import { ArrowLeft, Loader2, ShoppingCart, Star } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import AddToCartButton from '../components/AddToCartButton.jsx'
import { useProductService } from '../hooks/useProductService.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProductPage({ onNavigate, productId }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  const { formatPrice, isProductAvailable, getProductAvailabilityStatus } = useProductService()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (productId) {
      loadProductDetails(productId)
    }
  }, [productId])

  const loadProductDetails = async (id) => {
    try {
      setLoading(true)
      setError(null)
      
      // Get token if available, but don't require it for viewing products
      const token = localStorage.getItem('maricafe-token')
      
      const headers = {
        'Content-Type': 'application/json'
      }
      
      // Add authorization header only if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`http://127.0.0.1:4002/products/${id}`, {
        headers
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado')
        } else {
          throw new Error(`Error del servidor: ${response.status}`)
        }
      }
      
      const productData = await response.json()
      
      // Transform the backend data to frontend format
      const transformedProduct = {
        id: productData.product_id,
        nombre: productData.title,
        descripcion: productData.description,
        precio: productData.new_price || productData.price,
        precioOriginal: productData.price,
        descuento: productData.discount_percentage || 0,
        categoria: productData.category?.name || 'General',
        stock: productData.stock,
        imagen: null, // Will be loaded from backend
        attributes: productData.attributes || [],
        // Legacy fields for compatibility
        vegana: false,
        sinTacc: false,
        destacado: false
      }
      
      // Load product images
      try {
        const imageResponse = await fetch(`http://127.0.0.1:4002/images/${id}`)
        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          if (imageData && imageData.length > 0) {
            // Process all images and set main image as first
            const processedImages = imageData.map(base64Data => {
              const cleanBase64 = base64Data.replace(/\s/g, '')
              return `data:image/png;base64,${cleanBase64}`
            })
            transformedProduct.images = processedImages
            transformedProduct.imagen = processedImages[0] // Main image is first
          }
        }
      } catch (imageError) {
        console.log('No images found for product:', id)
      }
      
      // Process attributes to extract legacy fields
      if (productData.attributes && Array.isArray(productData.attributes)) {
        productData.attributes.forEach(attr => {
          if (attr.attribute && attr.value) {
            const attrName = attr.attribute.name?.toLowerCase()
            const attrValue = attr.value?.toLowerCase()
            
            if (attrName === 'vegan' || attrName === 'vegano') {
              transformedProduct.vegana = attrValue === 'true' || attrValue === 'si' || attrValue === 'yes'
            }
            if (attrName === 'sin tacc' || attrName === 'gluten-free') {
              transformedProduct.sinTacc = attrValue === 'true' || attrValue === 'si' || attrValue === 'yes'
            }
            if (attrName === 'destacado' || attrName === 'featured') {
              transformedProduct.destacado = attrValue === 'true' || attrValue === 'si' || attrValue === 'yes'
            }
          }
        })
        
        // Keep the original attributes array for display
        transformedProduct.attributes = productData.attributes
        
        // Debug: Log attributes structure
        console.log('Product attributes:', productData.attributes)
      }
      
      setProduct(transformedProduct)
    } catch (err) {
      console.error('Error loading product:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    onNavigate && onNavigate('productos')
  }

  const handleAddToCart = (product, quantity) => {
    // This will be handled by the AddToCartButton component
    console.log('Adding to cart:', product, quantity)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando producto...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Producto no encontrado'}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Productos
          </Button>
        </div>
      </div>
    )
  }

  const availabilityStatus = getProductAvailabilityStatus(product)
  const isAvailable = isProductAvailable(product)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        onClick={handleBack} 
        variant="outline" 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Productos
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImageIndex]}
                alt={product.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (!e.target.src.includes('placeholder-product.jpg')) {
                    e.target.src = '/placeholder-product.jpg'
                  }
                }}
                onLoad={() => {
                  console.log('Image loaded successfully for product:', product.nombre)
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📷</span>
                  </div>
                  <p className="text-sm">Sin imagen disponible</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Image thumbnails (if multiple images) */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.nombre} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Title and Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.categoria}</Badge>
              {product.destacado && <Badge variant="default">Destacado</Badge>}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.nombre}</h1>
            <p className="text-gray-600 text-lg">{product.descripcion}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.precio)}
            </span>
            {product.descuento > 0 && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.precioOriginal)}
                </span>
                <Badge variant="destructive" className="text-sm">
                  -{product.descuento}%
                </Badge>
              </>
            )}
          </div>

          {/* Availability Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isAvailable ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`font-medium ${
              isAvailable ? 'text-green-700' : 'text-red-700'
            }`}>
              {isAvailable ? 'Disponible' : 'No disponible'}
            </span>
            <span className="text-gray-500">• Stock: {product.stock}</span>
          </div>

          {/* Product Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Características del Producto</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {product.attributes.map((attr, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <span className="font-medium text-gray-600 text-sm">
                      {attr.attribute?.name || 'Atributo'}:
                    </span>
                    <span className="text-gray-900 text-sm text-right max-w-xs">
                      {(() => {
                        const value = attr.value || 'No especificado'
                        if (value === 'true' || value === 'True') return 'Sí'
                        if (value === 'false' || value === 'False') return 'No'
                        return value
                      })()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Badges */}
          <div className="flex flex-wrap gap-2">
            {product.vegana && <Badge variant="secondary">Vegano</Badge>}
            {product.sinTacc && <Badge variant="secondary">Sin TACC</Badge>}
          </div>

          {/* Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <AddToCartButton 
                product={product}
                onAddToCart={handleAddToCart}
                onNavigate={onNavigate}
                className="flex-1"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Envío gratuito en compras superiores a $50.000</p>
            <p>• Devolución gratuita en 30 días</p>
            <p>• Soporte al cliente 24/7</p>
          </div>
        </div>
      </div>
    </div>
  )
}
