// Product View - React component that uses MVC pattern
import React from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import AddToCartButton from '../../components/AddToCartButton.jsx'
import Button from '../../components/ui/Button.jsx'
import CategoryFilter from '../../components/CategoryFilter.jsx'
import PriceSort from '../../components/PriceSort.jsx'
import { useProductController } from '../hooks/useProductController.js'

export default function ProductView({ 
  showFilters = false,
  showSorting = false,
  showCategoryFilter = false
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
    clearError,
    retry,
    formatPrice,
    isProductAvailable,
    getProductAvailabilityStatus
  } = useProductController()

  const hasLoadedProducts = React.useRef(false)
  const hasLoadedCategories = React.useRef(false)

  // Load products when component mounts
  React.useEffect(() => {
    console.log('ProductView: useEffect for loadProducts called')
    console.log('ProductView: loadProducts function:', loadProducts)
    console.log('ProductView: hasLoadedProducts.current:', hasLoadedProducts.current)
    
    if (loadProducts && !hasLoadedProducts.current) {
      console.log('ProductView: Loading products...')
      hasLoadedProducts.current = true
      loadProducts().catch(error => {
        console.error('ProductView: Error loading products:', error)
      })
    }
  }, [loadProducts])

  // Load categories when showCategoryFilter is true
  React.useEffect(() => {
    if (showCategoryFilter && loadCategories && !hasLoadedCategories.current && categories.length === 0) {
      console.log('ProductView: Loading categories...')
      hasLoadedCategories.current = true
      loadCategories().catch(error => {
        console.error('ProductView: Error loading categories:', error)
      })
    }
  }, [showCategoryFilter, loadCategories, categories.length])

  // Handle category filter change - delegates to controller
  const handleCategoryChange = (categoryId) => {
    setCategoryFilter(categoryId)
  }

  // Handle price sort change - delegates to controller
  const handleSortChange = (sortOrder) => {
    setPriceSort(sortOrder)
  }

  // Get filtered products based on current filters
  let filteredProducts = products || [] // Default to all products, ensure it's an array
  
  if (getFilteredProducts) {
    try {
      const filtered = getFilteredProducts()
      filteredProducts = Array.isArray(filtered) ? filtered : (products || [])
    } catch (error) {
      console.error('ProductView: Error getting filtered products:', error)
      filteredProducts = products || [] // Fallback to all products
    }
  }
  
  // Ensure filteredProducts is always an array
  if (!Array.isArray(filteredProducts)) {
    console.warn('ProductView: filteredProducts is not an array, using products instead')
    filteredProducts = products || []
  }
  
  // Debug logging (can be removed in production)
  console.log('ProductView: products count:', products?.length || 0)
  console.log('ProductView: filteredProducts count:', filteredProducts?.length || 0)
  console.log('ProductView: current category filter:', getCurrentCategoryFilter())
  console.log('ProductView: current sort order:', getCurrentSortOrder())
  console.log('ProductView: categories count:', categories?.length || 0)

  // Handle retry
  const handleRetry = () => {
    clearError()
    retry()
  }

  // Loading state
  if (loading) {
    console.log('ProductView: Showing loading state')
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando productos...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive mb-4">{error}</div>
        <Button onClick={handleRetry} variant="outline">
          Reintentar
        </Button>
      </div>
    )
  }

  console.log('ProductView: Rendering with filteredProducts:', filteredProducts?.length || 0)
  console.log('ProductView: showCategoryFilter:', showCategoryFilter)
  console.log('ProductView: categories:', categories)

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      {(showCategoryFilter || showSorting) && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          {/* Category Filter */}
          {showCategoryFilter && (
            <CategoryFilter
              categories={categories}
              selectedCategory={getCurrentCategoryFilter() || 'all'}
              onCategoryChange={handleCategoryChange}
              loading={categoriesLoading}
            />
          )}
          
          {/* Price Sort */}
          {showSorting && (
            <PriceSort
              sortOptions={getAvailableSortOptions()}
              selectedSort={getCurrentSortOrder() || 'price-asc'}
              onSortChange={handleSortChange}
              loading={loading}
            />
          )}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts && filteredProducts.length > 0 ? filteredProducts.map((producto) => (
          <Card key={producto.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={producto.imagen || "/placeholder.svg"}
                  alt={producto.nombre}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {producto.destacado && (
                  <Badge className="absolute top-2 left-2 bg-primary">Destacado</Badge>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {producto.vegana && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Vegana
                    </Badge>
                  )}
                  {producto.sinTacc && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      Sin TACC
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{producto.descripcion}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(producto.precio)}
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {producto.categoria}
                  </Badge>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <AddToCartButton 
                product={producto}
                disabled={!isProductAvailable(producto)}
                availabilityStatus={getProductAvailabilityStatus(producto)}
              />
            </CardFooter>
          </Card>
        )) : null}
      </div>

      {/* No products message */}
      {(!filteredProducts || filteredProducts.length === 0) && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron productos con los filtros aplicados.</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">Error:</p>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          {!error && products.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-600 font-medium">No hay productos disponibles.</p>
              <p className="text-yellow-500 text-sm">Verifica que el backend esté ejecutándose en http://localhost:4002</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
