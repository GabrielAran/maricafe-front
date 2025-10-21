import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useProductService } from '../hooks/useProductService.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Badge from './ui/Badge.jsx'

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

  useEffect(() => {
    if (isAdmin()) {
      loadProducts()
    }
  }, [isAdmin, loadProducts])

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
        <h2 className="text-2xl font-bold mb-4">Gestión de Productos</h2>
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
                <span className="truncate">{product.title}</span>
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
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Categoría: {product.categoryName}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive">
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
    </div>
  )
}
