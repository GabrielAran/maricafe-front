// Product View - React component using Redux Toolkit
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Loader2, Search, X } from 'lucide-react'
import { Card, CardContent, CardFooter } from './ui/Card.jsx'
import Badge from './ui/Badge.jsx'
import AddToCartButton from './AddToCartButton.jsx'
import Button from './ui/Button.jsx'
import CategoryFilter from './CategoryFilter.jsx'
import PriceSort from './PriceSort.jsx'
import AttributeFilter from './AttributeFilter.jsx'
import { 
  fetchProducts, 
  fetchProductsByCategory, 
  fetchProductsFilteredByAttributes 
} from '../redux/slices/product.slice.js'
import { selectIsAdmin } from '../redux/slices/user.slice.js'
import { fetchCategories } from '../redux/slices/category.slice.js'
import { 
  fetchAllAttributes, 
  fetchAttributesByCategory 
} from '../redux/slices/attribute.slice.js'
import { fetchProductImages } from '../redux/slices/images.slice.js'
import { formatPrice } from '../utils/priceHelpers.js'
import { isProductAvailable } from '../utils/productHelpers.js'
import { selectActiveProducts } from '../redux/selectors/productSelectors.js'

export default function ProductViewNew({ 
  showFilters = false,
  showSorting = false,
  showCategoryFilter = false,
  onNavigate
}) {
  const dispatch = useDispatch()
  
  // Redux state
  const products = useSelector(selectActiveProducts)

  const productsPending = useSelector(state => state.products.pending)
  const productsError = useSelector(state => state.products.error)
  
  const categories = useSelector(state => state.category.categories)
  const categoriesPending = useSelector(state => state.category.pending)
  
  const attributes = useSelector(state => state.attributes.attributes)
  const attributesPending = useSelector(state => state.attributes.pending)
  
  // Auth state from Redux
  const isAdminUser = useSelector(selectIsAdmin)
  
  // Filter state (UI state, not in Redux)
  const [categoryFilter, setCategoryFilter] = React.useState('all')
  const [priceSort, setPriceSort] = React.useState('price-asc')
  const [attributeFilters, setAttributeFilters] = React.useState({})
  
  // Search term state (for client-side filtering)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')

  // Debounce search input to avoid filtering on every keystroke
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250)
    return () => clearTimeout(t)
  }, [searchTerm])
  
  // State for managing product quantities and images
  const [productQuantities, setProductQuantities] = React.useState({})
  const [productImages, setProductImages] = React.useState({})
  const [currentImageProductId, setCurrentImageProductId] = React.useState(null)
  const [processedImageProducts, setProcessedImageProducts] = React.useState(new Set())

  // Load images for products using Redux thunk (one at a time to track which product)
  React.useEffect(() => {
    if (products && products.length > 0 && !currentImageProductId) {
      // Find first product that needs images
      const productNeedingImage = products.find(
        product => !productImages[product.id] && !processedImageProducts.has(product.id)
      )
      
      if (productNeedingImage) {
        setCurrentImageProductId(productNeedingImage.id)
        setProcessedImageProducts(prev => new Set(prev).add(productNeedingImage.id))
        dispatch(fetchProductImages(productNeedingImage.id))
      }
    }
  }, [products, dispatch, productImages, currentImageProductId, processedImageProducts])
  
  // Process images from Redux state when they arrive
  const imagesState = useSelector(state => state.images.images)
  const imagesPending = useSelector(state => state.images.pending)
  React.useEffect(() => {
    if (currentImageProductId && !imagesPending && imagesState && Array.isArray(imagesState) && imagesState.length > 0) {
      // Process base64 images similar to ProductApiService
      const base64Data = imagesState[0]
      let finalData = null
      
      if (typeof base64Data === 'string') {
        finalData = base64Data
      } else if (base64Data && typeof base64Data === 'object') {
        if (base64Data.data) {
          finalData = base64Data.data
        } else if (base64Data.imagen) {
          finalData = base64Data.imagen
        } else if (base64Data.base64) {
          finalData = base64Data.base64
        }
      }
      
      if (finalData) {
        const cleanBase64 = finalData.toString()
          .replace(/\s/g, '')
          .replace(/^data:image\/[a-z]+;base64,/, '')
        const imageUrl = `data:image/png;base64,${cleanBase64}`
        setProductImages(prev => ({ ...prev, [currentImageProductId]: imageUrl }))
      }
      
      // Move to next product
      setCurrentImageProductId(null)
    }
  }, [imagesState, imagesPending, currentImageProductId])
  
  const hasLoadedCategories = React.useRef(false)
  const hasLoadedAttributes = React.useRef(false)
  const previousFiltersRef = React.useRef(null)

  // Load categories when component mounts (only once)
  React.useEffect(() => {
    if (!hasLoadedCategories.current) {
      dispatch(fetchCategories())
      hasLoadedCategories.current = true
    }
  }, [dispatch])

  // Load attributes when component mounts (only once)
  React.useEffect(() => {
    if (!hasLoadedAttributes.current) {
      dispatch(fetchAllAttributes())
      hasLoadedAttributes.current = true
    }
  }, [dispatch])
  
  // Load products on mount and when filters change
  // This consolidates initial load and filter changes into a single effect
  React.useEffect(() => {
    const sortParam = priceSort === 'price-asc' ? 'price,asc' : 
                    priceSort === 'price-desc' ? 'price,desc' : undefined
    const hasAttributeFilters = attributeFilters && Object.keys(attributeFilters).length > 0
    const categoryId = categoryFilter !== 'all' ? categoryFilter : null
    
    // Create a filter key to compare with previous state
    const currentFilterKey = JSON.stringify({
      sort: sortParam,
      categoryId,
      attributeFilters: hasAttributeFilters ? Object.entries(attributeFilters)
        .filter(([_, value]) => value && value !== '')
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}) : null
    })
    
    // Only dispatch if filters actually changed
    if (previousFiltersRef.current === currentFilterKey) {
      return
    }
    
    previousFiltersRef.current = currentFilterKey
    
    // Determine which thunk to dispatch based on filters
    if (hasAttributeFilters) {
      // Build attribute filters string
      const filterPairs = Object.entries(attributeFilters)
        .filter(([attributeId, value]) => value && value !== '')
        .map(([attributeId, value]) => `${attributeId}:${value}`)
      const attributeFiltersString = filterPairs.length > 0 ? filterPairs.join(',') : null
      
      dispatch(fetchProductsFilteredByAttributes({ 
        sort: sortParam, 
        categoryId, 
        attributeFilters: attributeFiltersString 
      }))
    } else if (categoryId) {
      dispatch(fetchProductsByCategory({ categoryId, sort: sortParam }))
    } else {
      dispatch(fetchProducts(sortParam))
    }
  }, [dispatch, priceSort, categoryFilter, attributeFilters])

  // Client-side search filtering (UI-only, filters already-loaded products)
  const filteredProducts = React.useMemo(() => {
    if (!debouncedSearch) return products

    const q = debouncedSearch.toLowerCase()
    return products.filter(product => {
      return (
        (product.nombre || '').toLowerCase().includes(q) ||
        (product.descripcion || '').toLowerCase().includes(q) ||
        (product.categoria || '').toLowerCase().includes(q)
      )
    })
  }, [products, debouncedSearch])

  // Handle category filter change
  const handleCategoryChange = (categoryId) => {
    setCategoryFilter(categoryId)
    // Clear attribute filters when category changes
    setAttributeFilters({})
    
    // Load category-specific attributes
    if (categoryId && categoryId !== 'all') {
      dispatch(fetchAttributesByCategory(categoryId))
    } else {
      // Load all attributes when no specific category is selected
      dispatch(fetchAllAttributes())
    }
  }

  // Handle price sort change
  const handleSortChange = (sortOrder) => {
    setPriceSort(sortOrder)
  }

  // Handle attribute filter change
  const handleAttributeChange = (attributeId, value, attributeType) => {
    if (!value || value === '') {
      const newFilters = { ...attributeFilters }
      delete newFilters[attributeId]
      setAttributeFilters(newFilters)
    } else {
      setAttributeFilters({
        ...attributeFilters,
        [attributeId]: value
      })
    }
  }

  // Handle clear attribute filters
  const handleClearAttributeFilters = () => {
    setAttributeFilters({})
  }

  // Handle retry
  const handleRetry = () => {
    const sortParam = priceSort === 'price-asc' ? 'price,asc' : 
                    priceSort === 'price-desc' ? 'price,desc' : undefined
    dispatch(fetchProducts(sortParam))
  }

  // Handle clear error (no-op since error is in Redux state)
  const handleClearError = () => {
    // Error is managed by Redux, no action needed
  }

  // Get active filter tags for display
  const getActiveFilterTags = () => {
    const tags = []
    
    // Add category filter tag
    if (categoryFilter && categoryFilter !== 'all') {
      // Handle both category_id (from backend) and id (legacy), and type conversion
      const category = categories.find(cat => {
        const catId = cat.category_id ?? cat.id
        return String(catId) === String(categoryFilter)
      })
      if (category) {
        tags.push({
          label: category.name,
          onRemove: () => handleCategoryChange('all')
        })
      }
    }

    // Add attribute filter tags
    Object.entries(attributeFilters).forEach(([attributeId, filterValue]) => {
      if (!filterValue) return
      
      const attribute = attributes.find(attr => attr.attribute_id == attributeId)
      if (!attribute) return

      if (Array.isArray(filterValue)) {
        // Multi-select filters
        filterValue.forEach(value => {
          tags.push({
            label: `${attribute.name}: ${value}`,
            onRemove: () => {
              const newValues = filterValue.filter(v => v !== value)
              handleAttributeChange(attributeId, newValues.length > 0 ? newValues : null, attribute.data_type)
            }
          })
        })
      } else {
        // Single value filters
        let displayValue = filterValue
        if (attribute.data_type === 'boolean') {
          // For boolean filters, show user-friendly labels
          if (filterValue === 'true') {
            displayValue = attribute.name === 'Vegano' ? 'Vegano' : 
                          attribute.name === 'Sin TACC' ? 'Sin TACC' : 
                          attribute.name
          } else if (filterValue === 'false') {
            displayValue = attribute.name === 'Vegano' ? 'No Vegano' : 
                          attribute.name === 'Sin TACC' ? 'No Sin TACC' : 
                          `No ${attribute.name}`
          }
        }
        
        tags.push({
          label: displayValue,
          onRemove: () => handleAttributeChange(attributeId, null, attribute.data_type)
        })
      }
    })

    return tags
  }

  // Show loading state
  if (productsPending) {
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
  if (productsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-red-500">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Error al cargar los productos</h3>
          <p className="text-muted-foreground max-w-md">{productsError}</p>
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
                loading={categoriesPending}
                selectedCategory={categoryFilter}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          )}
          {/* Price Sort */}
          {showSorting && (
            <div className="flex-1">
              <PriceSort
                currentSort={priceSort}
                sortOptions={[
                  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
                  { value: 'price-desc', label: 'Precio: Mayor a Menor' }
                ]}
                onSortChange={handleSortChange}
              />
            </div>
          )}

          {/* Search Input placed to the right of the filters on wider screens */}
          <div className="ml-auto w-full sm:w-72">
            <label className="sr-only">Buscar productos</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
                className="w-full border border-gray-300 rounded-md pl-10 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              {debouncedSearch && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-white rounded-lg border">
          <span className="text-sm font-medium text-gray-700 mr-2">Filtros activos:</span>
          {getActiveFilterTags().map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 rounded-full border border-gray-200 text-sm text-gray-700 hover:shadow-sm transition-shadow"
            >
              <span>{tag.label}</span>
              <button
                onClick={tag.onRemove}
                className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Attribute Filters Sidebar */}
        {showFilters && (
          <div className="lg:w-80 flex-shrink-0 order-2 lg:order-1">
            <AttributeFilter
              attributes={attributes}
              loading={attributesPending}
              attributeFilters={attributeFilters}
              onAttributeFilterChange={handleAttributeChange}
              selectedCategory={categoryFilter}
              className="sticky top-4 max-h-[calc(100vh-2rem)]"
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 order-1 lg:order-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id} 
            className="group hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
            onClick={() => onNavigate && onNavigate('product', { productId: product.id })}
          >
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="aspect-square bg-white rounded-lg mb-4 flex items-center justify-center p-4">
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
              
              <div className="space-y-2 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg line-clamp-2">{product.nombre}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{product.descripcion}</p>

                {/* Price + Discount */}
                <div className="flex items-center gap-2">
                  {product.descuento > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.precioOriginal)}
                      </span>
                      <span className="text-xl font-semibold text-primary">
                        {formatPrice(product.precio)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold">
                      {formatPrice(product.precio)}
                    </span>
                  )}

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
            
            <CardFooter className="p-4 pt-0 mt-auto">
              {!isAdminUser && (
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
                      image={productImages[product.id]}
                    />
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
          </div>

          {/* No products message */}
          {filteredProducts.length === 0 && !productsPending && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}