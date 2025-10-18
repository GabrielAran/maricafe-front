import React, { useState, useMemo, useEffect } from 'react'
import { Filter, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select.jsx'
import Checkbox from '../components/ui/Checkbox.jsx'
import AddToCartButton from '../components/AddToCartButton.jsx'
import Button from '../components/ui/Button.jsx'
import { ApiService, transformProduct } from '../services/api.js'

export default function ProductosPage() {
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas")
  const [filtroVegana, setFiltroVegana] = useState(false)
  const [filtroSinTacc, setFiltroSinTacc] = useState(false)
  const [ordenamiento, setOrdenamiento] = useState("destacados")
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  // Fetch productos from API
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true)
        setError(null)
        const sortParam = ordenamiento === "precio-asc" ? "price,asc" : 
                         ordenamiento === "precio-desc" ? "price,desc" : undefined
        const apiProducts = await ApiService.getProducts(sortParam)
        const transformedProducts = apiProducts.map(transformProduct)
        setProductos(transformedProducts)
      } catch (err) {
        console.error('Error fetching productos:', err)
        setError(err.message || 'Error al cargar los productos. Por favor, inténtalo de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [ordenamiento, retryKey])

  const productosFiltrados = useMemo(() => {
    const resultado = productos.filter((producto) => {
      // Filtro por categoría
      if (categoriaFiltro !== "todas" && producto.categoria !== categoriaFiltro) {
        return false
      }

      // Filtro vegana
      if (filtroVegana && !producto.vegana) {
        return false
      }

      // Filtro sin TACC
      if (filtroSinTacc && !producto.sinTacc) {
        return false
      }

      return true
    })

    // Ordenamiento local (ya que la API puede no soportar todos los filtros)
    switch (ordenamiento) {
      case "precio-asc":
        resultado.sort((a, b) => a.precio - b.precio)
        break
      case "precio-desc":
        resultado.sort((a, b) => b.precio - a.precio)
        break
      case "nombre":
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
      case "destacados":
      default:
        resultado.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0))
        break
    }

    return resultado
  }, [productos, categoriaFiltro, filtroVegana, filtroSinTacc, ordenamiento])

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  const clearFilters = () => {
    setCategoriaFiltro("todas")
    setFiltroVegana(false)
    setFiltroSinTacc(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => setRetryKey((k) => k + 1)}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Título y descripción */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold">
            Todos nuestros <span className="rainbow-text">Productos</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Descubre nuestra colección completa de tortas artesanales, servicios de catering y tazas especiales. Todos
            hechos con amor y diversidad.
          </p>
        </div>

        {/* Filtros y ordenamiento */}
        <div className="bg-muted/30 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por categoría */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  <SelectItem value="tortas">Tortas</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="tazas">Tazas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro ordenamiento */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar por</label>
              <Select value={ordenamiento} onValueChange={setOrdenamiento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="destacados">Destacados</SelectItem>
                  <SelectItem value="nombre">Nombre A-Z</SelectItem>
                  <SelectItem value="precio-asc">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="precio-desc">Precio: Mayor a Menor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros especiales */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Opciones especiales</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="vegana" checked={filtroVegana} onCheckedChange={setFiltroVegana} />
                  <label htmlFor="vegana" className="text-sm">
                    Solo veganas
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sinTacc" checked={filtroSinTacc} onCheckedChange={setFiltroSinTacc} />
                  <label htmlFor="sinTacc" className="text-sm">
                    Solo sin TACC
                  </label>
                </div>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Mostrando {productosFiltrados.length} de {productos.length} productos
              </p>
            </div>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <Card key={producto.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={producto.imagen || "/placeholder.svg"}
                    alt={producto.nombre}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {producto.destacado && <Badge className="absolute top-2 left-2 bg-primary">Destacado</Badge>}
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
                    <span className="text-lg font-bold text-primary">{formatearPrecio(producto.precio)}</span>
                    <Badge variant="outline" className="capitalize">
                      {producto.categoria}
                    </Badge>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <AddToCartButton product={producto} className="w-full" size="sm" />
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Mensaje si no hay productos */}
        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No se encontraron productos con los filtros seleccionados.</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Call to action */}
        <div className="text-center mt-16 space-y-4">
          <h2 className="text-2xl font-bold">¿No encuentras lo que buscas?</h2>
          <p className="text-muted-foreground">
            <span className="rainbow-text font-semibold">Contáctanos</span> para pedidos personalizados o consultas
            especiales
          </p>
          <Button variant="outline">
            Contactar
          </Button>
        </div>
      </div>
    </div>
  )
}
