import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import AddToCartButton from '../components/AddToCartButton.jsx'
import { fetchProductById, selectCurrentProduct, selectProductError, selectProductPending } from '../redux/slices/product.slice.js'
import { fetchProductImages } from '../redux/slices/images.slice.js'
import { formatPrice, isProductAvailable, getProductAvailabilityStatus } from '../utils/productHelpers.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProductPage({ onNavigate, productId }) {
  const dispatch = useDispatch()

  // Redux product state
  const product = useSelector(selectCurrentProduct)
  const loading = useSelector(selectProductPending)
  const error = useSelector(selectProductError)

  // Redux images state
  const imagesState = useSelector(state => state.images.images)
  const imagesPending = useSelector(state => state.images.pending)

  // Local UI state
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [productImages, setProductImages] = React.useState([])

  const { isAuthenticated } = useAuth()

  const hasInitialized = React.useRef(false)

  /**
   * Load product details and images via Redux thunks.
   * StrictMode-safe: guarded by ref + stable primitive deps.
   */
  React.useEffect(() => {
    if (!productId) return
    if (hasInitialized.current) return

    hasInitialized.current = true
    dispatch(fetchProductById(productId))
    dispatch(fetchProductImages(productId))
  }, [productId, dispatch])

  // Process images from Redux state into data URLs for this product
  React.useEffect(() => {
    if (!imagesState || !Array.isArray(imagesState) || imagesPending) {
      return
    }

    const processedImages = imagesState
      .map((item) => {
        let base64Data = null

        if (typeof item === 'string') {
          base64Data = item
        } else if (item && typeof item === 'object') {
          if (item.file) {
            base64Data = item.file
          } else if (item.data) {
            base64Data = item.data
          } else if (item.imagen) {
            base64Data = item.imagen
          } else if (item.base64) {
            base64Data = item.base64
          }
        }

        if (!base64Data) return null

        const cleanBase64 = base64Data
          .toString()
          .replace(/\s/g, '')
          .replace(/^data:image\/[a-z]+;base64,/, '')

        return `data:image/png;base64,${cleanBase64}`
      })
      .filter(Boolean)

    setProductImages(processedImages)
    setSelectedImageIndex(0)
  }, [imagesState, imagesPending])

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

  const effectiveImages = productImages && productImages.length > 0
    ? productImages
    : (product.imagen ? [product.imagen] : [])

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
            {effectiveImages && effectiveImages.length > 0 ? (
              <img
                src={effectiveImages[selectedImageIndex]}
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
          {effectiveImages && effectiveImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {effectiveImages.map((image, index) => (
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
          {product.attributesList && product.attributesList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Características del Producto</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {product.attributesList.map((attr, index) => (
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
                image={product.imagen}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Envío gratuito en compras superiores a $50.000</p>
            <p>• Soporte al cliente 24/7</p>
          </div>
        </div>
      </div>
    </div>
  )
}
