// Product View - React component using new entity services
import React from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from './ui/Card.jsx'
import Badge from './ui/Badge.jsx'
import AddToCartButton from './AddToCartButton.jsx'
import Button from './ui/Button.jsx'
import CategoryFilter from './CategoryFilter.jsx'
import PriceSort from './PriceSort.jsx'
import AttributeFilter from './AttributeFilter.jsx'
import { useProductService } from '../hooks/useProductService.js'
import { useAttributeService } from '../hooks/useAttributeService.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ProductApiService } from '../services/ProductApiService.js'

export default function ProductViewNew({ 
  showFilters = false,
  showSorting = false,
  showCategoryFilter = false,
  onNavigate
}) {
  const {
    products,
    categories,
    loading,
    categoriesLoading,
    error,
    filters,
    loadProducts,
    loadCategories,
    getFilteredProducts,
    setCategoryFilter,
    getCurrentCategoryFilter,
    setPriceSort,
    getCurrentSortOrder,
    getAvailableSortOptions,
    setAttributeFilter,
    clearAttributeFilters,
    getCurrentAttributeFilters,
    clearError,
    retry,
    formatPrice,
    isProductAvailable,
    getProductAvailabilityStatus
  } = useProductService()

  const { attributes, loading: attributesLoading, loadAttributes, getAttributesByCategory } = useAttributeService()
  const { isAdmin, isAuthenticated, user } = useAuth()
  
  // State for managing product quantities and images
  const [productQuantities, setProductQuantities] = React.useState({})
  const [productImages, setProductImages] = React.useState({})

  // Load images for products
  const loadProductImages = React.useCallback(async (products) => {
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
  }, [])

  // Load images when products change
  React.useEffect(() => {
    if (products && products.length > 0) {
      loadProductImages(products)
    }
  }, [products, loadProductImages])
  
  // Debug: Log attributes when they change
  React.useEffect(() => {
    console.log('ProductViewNew: Attributes updated:', attributes)
  }, [attributes])

  // Debug: Log admin status and user info
  React.useEffect(() => {
    console.log('ProductViewNew: User info:', { 
      isAuthenticated, 
      isAdmin: isAdmin(), 
      user: user,
      userRole: user?.role 
    })
  }, [isAuthenticated, isAdmin, user])

  const hasLoadedProducts = React.useRef(false)
  const hasLoadedCategories = React.useRef(false)
  const hasLoadedAttributes = React.useRef(false)

  // Load products when component mounts
  React.useEffect(() => {
    if (!hasLoadedProducts.current) {
      console.log('ProductViewNew: Loading products...')
      loadProducts()
      hasLoadedProducts.current = true
    }
  }, []) // Remove loadProducts dependency to prevent infinite loop

  // Load categories when component mounts
  React.useEffect(() => {
    if (!hasLoadedCategories.current) {
      console.log('ProductViewNew: Loading categories...')
      loadCategories()
      hasLoadedCategories.current = true
    }
  }, []) // Remove loadCategories dependency to prevent infinite loop

  // Load attributes when component mounts
  React.useEffect(() => {
    if (!hasLoadedAttributes.current) {
      console.log('ProductViewNew: Loading attributes...')
      loadAttributes()
      hasLoadedAttributes.current = true
    }
  }, [loadAttributes])

  // Get filtered products (memoized to prevent unnecessary recalculations)
  const filteredProducts = React.useMemo(() => {
    return getFilteredProducts()
  }, [products, filters.category, filters.vegan, filters.sinTacc, filters.sort, filters.attributes]) // Use specific filter properties

  // Handle category filter change
  const handleCategoryChange = async (categoryId) => {
    console.log('ProductViewNew: Category filter changed to:', categoryId)
    setCategoryFilter(categoryId)
    // Clear attribute filters when category changes since different categories have different attributes
    clearAttributeFilters()
    
    // Load category-specific attributes
    if (categoryId && categoryId !== 'all') {
      try {
        console.log('ProductViewNew: Loading attributes for category:', categoryId)
        await getAttributesByCategory(categoryId)
      } catch (error) {
        console.error('ProductViewNew: Error loading category attributes:', error)
      }
    } else {
      // Load all attributes when no specific category is selected
      try {
        console.log('ProductViewNew: Loading all attributes')
        await loadAttributes()
      } catch (error) {
        console.error('ProductViewNew: Error loading all attributes:', error)
      }
    }
  }

  // Handle price sort change
  const handleSortChange = (sortOrder) => {
    console.log('ProductViewNew: Sort order changed to:', sortOrder)
    setPriceSort(sortOrder)
  }

  // Handle attribute filter change
  const handleAttributeChange = (attributeId, value, attributeType) => {
    console.log('ProductViewNew: Attribute filter changed:', { attributeId, value, attributeType })
    setAttributeFilter(attributeId, value, attributeType)
  }

  // Handle clear attribute filters
  const handleClearAttributeFilters = () => {
    console.log('ProductViewNew: Clearing attribute filters')
    clearAttributeFilters()
  }

  // Handle retry
  const handleRetry = () => {
    console.log('ProductViewNew: Retrying...')
    retry()
  }

  // Handle clear error
  const handleClearError = () => {
    console.log('ProductViewNew: Clearing error')
    clearError()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-red-500">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Error al cargar los productos</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <div className="flex gap-2">
            <Button onClick={handleRetry} variant="outline">
              Reintentar
            </Button>
            <Button onClick={handleClearError} variant="ghost">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Filters - Category and Sorting */}
      {showFilters && (showCategoryFilter || showSorting) && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Category Filter */}
          {showCategoryFilter && (
            <div className="flex-1">
              <CategoryFilter
                categories={categories}
                loading={categoriesLoading}
                currentCategory={getCurrentCategoryFilter()}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          )}

          {/* Price Sort */}
          {showSorting && (
            <div className="flex-1">
              <PriceSort
                currentSort={getCurrentSortOrder()}
                sortOptions={getAvailableSortOptions()}
                onSortChange={handleSortChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Attribute Filters Sidebar */}
        {showFilters && (
          <div className="lg:w-80 flex-shrink-0 order-2 lg:order-1">
            <AttributeFilter
              attributes={attributes}
              loading={attributesLoading}
              attributeFilters={getCurrentAttributeFilters()}
              onAttributeFilterChange={handleAttributeChange}
              selectedCategory={getCurrentCategoryFilter()}
              className="sticky top-4"
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 order-1 lg:order-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id} 
            className="group hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate && onNavigate('product', { productId: product.id })}
          >
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                {productImages[product.id] ? (
                  <img
                    src={productImages[product.id]}
                    alt={product.nombre}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      console.error('Error loading image for product:', product.id)
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48L3N2Zz4=' // Placeholder SVG
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2">{product.nombre}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.descripcion}</p>
                
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{formatPrice(product.precio)}</span>
                  {product.descuento > 0 && (
                    <Badge variant="destructive">
                      -{product.descuento}%
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {product.vegana && <Badge variant="secondary">Vegano</Badge>}
                  {product.sinTacc && <Badge variant="secondary">Sin TACC</Badge>}
                  {product.destacado && <Badge variant="default">Destacado</Badge>}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
              {!isAdmin() && (
                <div className="w-full space-y-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-center space-x-3" onClick={(e) => e.stopPropagation()}>
                    <label className="text-sm font-medium text-muted-foreground">
                      Cantidad:
                    </label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const currentQty = productQuantities[product.id] || 1
                          if (currentQty > 1) {
                            setProductQuantities(prev => ({
                              ...prev,
                              [product.id]: currentQty - 1
                            }))
                          }
                        }}
                        disabled={!isProductAvailable(product, false)}
                      >
                        -
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {productQuantities[product.id] || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const currentQty = productQuantities[product.id] || 1
                          const maxQty = Math.min(product.stock, 10) // Limit to stock or 10 max
                          if (currentQty < maxQty) {
                            setProductQuantities(prev => ({
                              ...prev,
                              [product.id]: currentQty + 1
                            }))
                          }
                        }}
                        disabled={!isProductAvailable(product, false)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <AddToCartButton
                      product={product}
                      quantity={productQuantities[product.id] || 1}
                      disabled={!isProductAvailable(product, false)}
                      className="w-full"
                      onNavigate={onNavigate}
                    />
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
          </div>

          {/* No products message */}
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
