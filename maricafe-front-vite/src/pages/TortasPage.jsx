import React, { useState, useMemo, useEffect } from 'react'
import { Cake, Heart, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select.jsx'
import Checkbox from '../components/ui/Checkbox.jsx'
import AddToCartButton from '../components/AddToCartButton.jsx'
import Button from '../components/ui/Button.jsx'
import { ApiService, transformProduct } from '../services/api.js'

export default function TortasPage() {
  const [filtroVegana, setFiltroVegana] = useState(false)
  const [filtroSinTacc, setFiltroSinTacc] = useState(false)
  const [ordenamiento, setOrdenamiento] = useState("destacados")
  const [tortas, setTortas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  // Fetch tortas from API (filter by category "tortas")
  useEffect(() => {
    const fetchTortas = async () => {
      try {
        setLoading(true)
        setError(null)
        const sortParam = ordenamiento === "precio-asc" ? "price,asc" : 
                         ordenamiento === "precio-desc" ? "price,desc" : undefined
        const apiProducts = await ApiService.getProducts(sortParam)
        // Filter for tortas category
        const tortasProducts = apiProducts.filter(product => 
          product.categoria?.name?.toLowerCase() === 'tortas' || 
          product.categoria?.name?.toLowerCase() === 'torta'
        )
        const transformedProducts = tortasProducts.map(transformProduct)
        setTortas(transformedProducts)
      } catch (err) {
        console.error('Error fetching tortas:', err)
        setError(err.message || 'Error al cargar las tortas. Por favor, inténtalo de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchTortas()
  }, [ordenamiento, retryKey])

  const tortasFiltradas = useMemo(() => {
    const resultado = tortas.filter((torta) => {
      if (filtroVegana && !torta.vegana) return false
      if (filtroSinTacc && !torta.sinTacc) return false
      return true
    })

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
  }, [tortas, filtroVegana, filtroSinTacc, ordenamiento])

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Cargando tortas...</p>
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
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center space-x-3">
            <Cake className="h-8 w-8 text-primary" />
            <h1 className="text-3xl lg:text-4xl font-bold">
              Nuestras <span className="rainbow-text">Tortas</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Cada torta es una obra de arte comestible, creada con amor y los mejores ingredientes. Desde nuestras
            famosas Rainbow Cakes hasta opciones veganas y sin TACC, tenemos el sabor perfecto para cada celebración.
          </p>
          <div className="flex items-center justify-center space-x-2 text-primary">
            <Heart className="h-5 w-5" />
            <span className="font-medium">Hechas con amor artesanal</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-muted/30 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Mostrando {tortasFiltradas.length} de {tortas.length} tortas
              </p>
            </div>
          </div>
        </div>

        {/* Grid de tortas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tortasFiltradas.map((torta) => (
            <Card key={torta.id} className="group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={torta.imagen || "/placeholder.svg"}
                    alt={torta.nombre}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  {torta.destacado && <Badge className="absolute top-3 left-3 bg-primary">Destacado</Badge>}
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    {torta.vegana && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Vegana
                      </Badge>
                    )}
                    {torta.sinTacc && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        Sin TACC
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2">{torta.nombre}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{torta.descripcion}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="font-medium">{torta.stock} disponibles</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-primary">{formatearPrecio(torta.precio)}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <AddToCartButton product={torta} className="w-full" size="lg" />
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-16 bg-muted/30 rounded-lg p-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">Información sobre nuestras tortas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Pedidos personalizados</h3>
                <p>
                  ¿Necesitas una torta con diseño específico? Contáctanos para crear algo único para tu celebración.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tiempo de preparación</h3>
                <p>Nuestras tortas se preparan con 48-72 horas de anticipación para garantizar la máxima frescura.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Ingredientes premium</h3>
                <p>Utilizamos solo ingredientes de primera calidad y colorantes naturales para nuestras creaciones.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Opciones inclusivas</h3>
                <p>Todas nuestras recetas pueden adaptarse para ser veganas o sin TACC bajo pedido especial.</p>
              </div>
            </div>
            <Button variant="outline" className="mt-6 bg-transparent">
              Hacer pedido personalizado
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
