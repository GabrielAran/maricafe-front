// Product View - React component using Redux Toolkit
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2, Search, X } from 'lucide-react'
import { Card, CardContent, CardFooter } from './ui/Card.jsx'
import Badge from './ui/Badge.jsx'
import AddToCartButton from './AddToCartButton.jsx'
import Button from './ui/Button.jsx'
import CategoryFilter from './CategoryFilter.jsx'
import PriceSort from './PriceSort.jsx'
import AttributeFilter from './AttributeFilter.jsx'

// Redux Thunks & Actions
import {
  fetchProductsByCategory,
  fetchProductsFilteredByAttributes,
  fetchProductsByAttributes,
  fetchProductsWithAttributes
} from '../redux/slices/product.slice'
import { fetchCategories } from '../redux/slices/category.slice'
import { fetchAllAttributes, fetchAttributesByCategory } from '../redux/slices/attribute.slice'
import { fetchProductImages } from '../redux/slices/images.slice'

export default function ProductViewNew({
  showFilters = false,
  showSorting = false,
  showCategoryFilter = false,
  onNavigate
}) {
  const dispatch = useDispatch()

  // Redux State
  const { products, pending: productsLoading, error: productsError } = useSelector(state => state.products)
  const { categories, pending: categoriesLoading } = useSelector(state => state.category)
  const { attributes, pending: attributesLoading } = useSelector(state => state.attributes)
  const { currentUser } = useSelector(state => state.user)

  const isAdmin = currentUser?.role === 'ADMIN'

  // Local UI State
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [currentCategory, setCurrentCategory] = React.useState('all')
  const [currentSort, setCurrentSort] = React.useState('')
  const [currentAttributeFilters, setCurrentAttributeFilters] = React.useState({})

  // State for managing product quantities and images
  const [productQuantities, setProductQuantities] = React.useState({})
  const [productImages, setProductImages] = React.useState({})

  // Loading state aggregation
  const loading = productsLoading || (showCategoryFilter && categoriesLoading) || (showFilters && attributesLoading)
  const error = productsError

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250)
    return () => clearTimeout(t)
  }, [searchTerm])

  // Initial Load
  React.useEffect(() => {
    // Load initial products (with attributes for badges)
    dispatch(fetchProductsWithAttributes())

    if (showCategoryFilter) {
      dispatch(fetchCategories())
    }

    if (showFilters) {
      dispatch(fetchAllAttributes())
    }
  }, [dispatch, showCategoryFilter, showFilters])

  // Handle Search
  React.useEffect(() => {
    if (debouncedSearch) {
      // Use thunk for search
      dispatch(fetchProductsByAttributes({ title: debouncedSearch }))
    } else if (searchTerm === '' && debouncedSearch === '') {
      // Reset to current category view if search is cleared
      if (currentCategory !== 'all') {
        dispatch(fetchProductsByCategory({ categoryId: currentCategory, sort: currentSort }))
      } else {
        dispatch(fetchProductsWithAttributes(currentSort))
      }
    }
  }, [debouncedSearch, dispatch, currentCategory, currentSort])

  // Load images when products change
  React.useEffect(() => {
    if (products && products.length > 0) {
      products.forEach(product => {
        const pid = product.id || product.product_id
        // Fire-and-forget dispatch as per rules, but handle promise to update local state
        // because Redux slice does not support storing images for multiple products.
        dispatch(fetchProductImages(pid))
          .then((action) => {
            if (fetchProductImages.fulfilled.match(action)) {
              const base64Images = action.payload
              if (base64Images && base64Images.length > 0) {
                // Process the first image similar to the original service logic
                const firstImage = base64Images[0]
                let finalData = null

                if (typeof firstImage === 'string') {
                  finalData = firstImage
                } else if (firstImage && typeof firstImage === 'object') {
                  finalData = firstImage.data || firstImage.imagen || firstImage.base64
                }

                if (finalData) {
                  const cleanBase64 = finalData.toString()
                    .replace(/\s/g, '')
                    .replace(/^data:image\/[a-z]+;base64,/, '')

                  const url = `data:image/png;base64,${cleanBase64}`

                  setProductImages(prev => ({
                    ...prev,
                    [pid]: url
                  }))
                }
              }
            }
          })
      })
    }
  }, [products, dispatch])

  // Helper: Format Price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  // Helper: Check Availability
  const isProductAvailable = (product, checkStock = true) => {
    if (!product) return false
    if (!product.disponible) return false
    if (checkStock && product.stock <= 0) return false
    return true
  }

  // Handle category filter change
  const handleCategoryChange = (categoryId) => {
    console.log('ProductViewNew: Category filter changed to:', categoryId)
    setCurrentCategory(categoryId)
    setCurrentAttributeFilters({}) // Clear attribute filters

    if (categoryId && categoryId !== 'all') {
      dispatch(fetchProductsByCategory({ categoryId, sort: currentSort }))
      dispatch(fetchAttributesByCategory(categoryId))
    } else {
      dispatch(fetchProductsWithAttributes(currentSort))
      dispatch(fetchAllAttributes())
    }
  }

  // Handle price sort change
  const handleSortChange = (sortOrder) => {
    console.log('ProductViewNew: Sort order changed to:', sortOrder)
    setCurrentSort(sortOrder)

    // Re-fetch with new sort based on current context
    if (Object.keys(currentAttributeFilters).length > 0) {
      dispatch(fetchProductsFilteredByAttributes({
        sort: sortOrder,
        categoryId: currentCategory !== 'all' ? currentCategory : undefined,
        attributeFilters: JSON.stringify(currentAttributeFilters)
      }))
    } else if (currentCategory !== 'all') {
      dispatch(fetchProductsByCategory({ categoryId: currentCategory, sort: sortOrder }))
    } else {
      dispatch(fetchProductsWithAttributes(sortOrder))
    }
  }

  // Handle attribute filter change
  const handleAttributeChange = (attributeId, value, attributeType) => {
    console.log('ProductViewNew: Attribute filter changed:', { attributeId, value, attributeType })

    const newFilters = { ...currentAttributeFilters }

    if (value === null || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[attributeId]
    } else {
      newFilters[attributeId] = value
    }

    setCurrentAttributeFilters(newFilters)

    dispatch(fetchProductsFilteredByAttributes({
      sort: currentSort,
      categoryId: currentCategory !== 'all' ? currentCategory : undefined,
      attributeFilters: JSON.stringify(newFilters)
    }))
  }

  // Handle clear attribute filters
  const handleClearAttributeFilters = () => {
    console.log('ProductViewNew: Clearing attribute filters')
    setCurrentAttributeFilters({})

    if (currentCategory !== 'all') {
      dispatch(fetchProductsByCategory({ categoryId: currentCategory, sort: currentSort }))
    } else {
      dispatch(fetchProductsWithAttributes(currentSort))
    }
  }

  // Handle retry
  const handleRetry = () => {
    console.log('ProductViewNew: Retrying...')
    // Retry based on current state
    if (currentCategory !== 'all') {
      dispatch(fetchProductsByCategory({ categoryId: currentCategory, sort: currentSort }))
    } else {
      dispatch(fetchProductsWithAttributes(currentSort))
    }
  }

  // Handle clear error
  const handleClearError = () => {
    handleRetry()
  }

  // Get active filter tags for display
  const getActiveFilterTags = () => {
    const tags = []

    // Add category filter tag
    if (currentCategory && currentCategory !== 'all') {
      const category = categories.find(cat => cat.id == currentCategory || cat.category_id == currentCategory)
      if (category) {
        tags.push({
          label: category.name,
          onRemove: () => handleCategoryChange('all')
        })
      }
    }

    // Add attribute filter tags
    Object.entries(currentAttributeFilters).forEach(([attributeId, filterValue]) => {
      if (!filterValue) return

      const attribute = attributes.find(attr => attr.attribute_id == attributeId || attr.id == attributeId)
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
  if (loading && products.length === 0) {
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
                currentCategory={currentCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          )}
          {/* Price Sort */}
          {showSorting && (
            <div className="flex-1">
              <PriceSort
                currentSort={currentSort}
                sortOptions={[
                  { value: 'price,asc', label: 'Menor precio' },
                  { value: 'price,desc', label: 'Mayor precio' },
                  { value: 'name,asc', label: 'Nombre A-Z' },
                  { value: 'name,desc', label: 'Nombre Z-A' }
                ]}
                onSortChange={handleSortChange}
              />
            </div>
          )}

          {/* Search Input */}
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
              loading={attributesLoading}
              attributeFilters={currentAttributeFilters}
              onAttributeFilterChange={handleAttributeChange}
              selectedCategory={currentCategory}
              className="sticky top-4 max-h-[calc(100vh-2rem)]"
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 order-1 lg:order-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id || product.product_id}
                className="group hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
                onClick={() => onNavigate && onNavigate('product', { productId: product.id || product.product_id })}
              >
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="aspect-square bg-white rounded-lg mb-4 flex items-center justify-center p-4">
                    {productImages[product.id || product.product_id] ? (
                      <img
                        src={productImages[product.id || product.product_id]}
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

                <CardFooter className="p-4 pt-0 mt-auto">
                  {!isAdmin && (
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
                              const pid = product.id || product.product_id
                              const currentQty = productQuantities[pid] || 1
                              if (currentQty > 1) {
                                setProductQuantities(prev => ({
                                  ...prev,
                                  [pid]: currentQty - 1
                                }))
                              }
                            }}
                            disabled={!isProductAvailable(product, false)}
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {productQuantities[product.id || product.product_id] || 1}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              const pid = product.id || product.product_id
                              const currentQty = productQuantities[pid] || 1
                              const maxQty = Math.min(product.stock, 10)
                              if (currentQty < maxQty) {
                                setProductQuantities(prev => ({
                                  ...prev,
                                  [pid]: currentQty + 1
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
                          quantity={productQuantities[product.id || product.product_id] || 1}
                          disabled={!isProductAvailable(product, false)}
                          className="w-full"
                          onNavigate={onNavigate}
                          image={productImages[product.id || product.product_id]}
                        />
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* No products message */}
          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
