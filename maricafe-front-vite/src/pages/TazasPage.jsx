import React, { useState, useMemo, useEffect } from 'react'
import { Gift, Heart, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select.jsx'
import AddToCartButton from '../components/AddToCartButton.jsx'
import Button from '../components/ui/Button.jsx'
import { ApiService, transformProduct } from '../services/api.js'

export default function TazasPage() {
  const [ordenamiento, setOrdenamiento] = useState("destacados")
  const [tazas, setTazas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  // Fetch tazas from API (filter by category "tazas")
  useEffect(() => {
    const fetchTazas = async () => {
      try {
        setLoading(true)
        setError(null)
        const sortParam = ordenamiento === "precio-asc" ? "price,asc" : 
                         ordenamiento === "precio-desc" ? "price,desc" : undefined
        const apiProducts = await ApiService.getProducts(sortParam)
        // Filter for tazas category
        const tazasProducts = apiProducts.filter(product => 
          product.categoria?.name?.toLowerCase() === 'tazas' || 
          product.categoria?.name?.toLowerCase() === 'taza'
        )
        const transformedProducts = tazasProducts.map(transformProduct)
        setTazas(transformedProducts)
      } catch (err) {
        console.error('Error fetching tazas:', err)
        setError(err.message || 'Error al cargar las tazas. Por favor, inténtalo de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchTazas()
  }, [ordenamiento, retryKey])

  const tazasFiltradas = useMemo(() => {
    const resultado = [...tazas]

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
  }, [tazas, ordenamiento])

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
          <p>Cargando tazas...</p>
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
            <Gift className="h-8 w-8 text-primary" />
            <h1 className="text-3xl lg:text-4xl font-bold">
              Nuestras <span className="rainbow-text">Tazas</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Cada taza cuenta una historia de inclusión y diversidad. Diseñadas con amor para celebrar la
            identidad y el orgullo, son perfectas para tu café matutino o como regalo especial.
          </p>
          <div className="flex items-center justify-center space-x-2 text-primary">
            <Heart className="h-5 w-5" />
            <span className="font-medium">Diseñadas con propósito</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-muted/30 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Mostrando {tazasFiltradas.length} de {tazas.length} tazas
              </p>
            </div>
          </div>
        </div>

        {/* Grid de tazas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tazasFiltradas.map((taza) => (
            <Card key={taza.id} className="group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={taza.imagen || "/placeholder.svg"}
                    alt={taza.nombre}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  {taza.destacado && <Badge className="absolute top-3 left-3 bg-primary">Destacado</Badge>}
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    {taza.vegana && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Vegana
                      </Badge>
                    )}
                    {taza.sinTacc && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        Sin TACC
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2">{taza.nombre}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{taza.descripcion}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="font-medium">{taza.stock} disponibles</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-primary">{formatearPrecio(taza.precio)}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <AddToCartButton product={taza} className="w-full" size="lg" />
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-16 bg-muted/30 rounded-lg p-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">Información sobre nuestras tazas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Diseños personalizados</h3>
                <p>
                  ¿Tienes una idea específica? Podemos crear tazas personalizadas con tu diseño o mensaje especial.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Material premium</h3>
                <p>Todas nuestras tazas están hechas con cerámica de alta calidad, aptas para lavavajillas y microondas.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Compromiso social</h3>
                <p>Parte de las ganancias se destina a organizaciones que apoyan la diversidad y la inclusión.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Envío seguro</h3>
                <p>Empacamos cada taza con cuidado especial para que llegue en perfectas condiciones a tu hogar.</p>
              </div>
            </div>
            <Button variant="outline" className="mt-6 bg-transparent">
              Solicitar personalización
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
