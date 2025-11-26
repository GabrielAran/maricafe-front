import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Cake, Gift, Users, Heart, ArrowRight } from 'lucide-react'
import CakeCarousel from '../components/CakeCarousel.jsx'
import { fetchProducts } from '../redux/slices/product.slice.js'
import { fetchProductImages } from '../redux/slices/images.slice.js'
import { selectIsAdmin } from '../redux/slices/user.slice.js'

export default function HomePage({ onNavigate }) {
  const dispatch = useDispatch()
  
  // Redux state
  const products = useSelector(state => state.products.products)
  const productsPending = useSelector(state => state.products.pending)
  const isAdminUser = useSelector(selectIsAdmin)
  
  // Images state
  const imagesState = useSelector(state => state.images.images)
  const imagesPending = useSelector(state => state.images.pending)
  
  // UI state
  const [cakeProducts, setCakeProducts] = useState([])
  const [productImages, setProductImages] = useState({})
  const [currentImageProductId, setCurrentImageProductId] = useState(null)
  const [processedImageProducts, setProcessedImageProducts] = useState(new Set())
  
  // StrictMode-safe initialization
  const hasInitialized = useRef(false)

  // Load products when component mounts (only once)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      dispatch(fetchProducts())
    }
  }, [dispatch])

  // Filter products to get only cakes when products are loaded
  useEffect(() => {
    if (products && products.length > 0) {
      // Try different possible category names for cakes
      const possibleCakeCategories = ['tortas', 'torta', 'cakes', 'cake', 'tortas artesanales']
      let cakeProducts = []
      
      // Filter by category name
      for (const categoryName of possibleCakeCategories) {
        const categoryProducts = products.filter(product => {
          const productCategory = product.categoria?.toLowerCase() || ''
          return productCategory === categoryName.toLowerCase()
        })
        if (categoryProducts && categoryProducts.length > 0) {
          cakeProducts = categoryProducts
          break
        }
      }
      
      // If no specific cake category found, filter by product name containing cake-related keywords
      if (cakeProducts.length === 0) {
        cakeProducts = products.filter(product => {
          const name = product.nombre?.toLowerCase() || ''
          const description = product.descripcion?.toLowerCase() || ''
          return name.includes('torta') || name.includes('cake') || 
                 description.includes('torta') || description.includes('cake')
        })
      }
      
      // Transform to cake format (UI-specific transformation)
      const transformedCakes = cakeProducts.slice(0, 5).map(product => ({
        id: product.id,
        name: product.nombre,
        image: productImages[product.id] || '/placeholder.jpg',
        description: product.descripcion || 'Deliciosa torta artesanal'
      }))
      
      setCakeProducts(transformedCakes)
    }
  }, [products, productImages])

  // Load images for products using Redux thunk (one at a time to track which product)
  useEffect(() => {
    if (cakeProducts && cakeProducts.length > 0 && !currentImageProductId) {
      // Find first product that needs images
      const productNeedingImage = cakeProducts.find(
        product => !productImages[product.id] && !processedImageProducts.has(product.id)
      )
      
      if (productNeedingImage) {
        setCurrentImageProductId(productNeedingImage.id)
        setProcessedImageProducts(prev => new Set(prev).add(productNeedingImage.id))
        dispatch(fetchProductImages(productNeedingImage.id))
      }
    }
  }, [cakeProducts, dispatch, productImages, currentImageProductId, processedImageProducts])

  // Process images from Redux state when they arrive
  useEffect(() => {
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

  // Handle cake click navigation
  const handleCakeClick = (cake) => {
    if (onNavigate && cake.id) {
      onNavigate('product', { productId: cake.id })
    }
  }

  // Handle navigation based on user role
  const handleProductsNavigation = () => {
    if (onNavigate) {
      if (isAdminUser) {
        onNavigate('admin')
      } else {
        onNavigate('productos')
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 min-h-[60vh] bg-cover bg-center bg-no-repeat bg-fixed" style={{
        backgroundImage: 'url(/maricafe_local.png)'
      }}>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center">
            <div className="text-center space-y-4 inline-block bg-black/30 backdrop-blur-sm rounded-xl px-4 py-3">
              {/* Logo and main title removed as requested; box will shrink to fit content */}
            
            <h2 className="text-2xl lg:text-3xl font-semibold text-white drop-shadow-lg">
              Cafetería LGBT+ Especializada
            </h2>
            
            <p className="text-lg lg:text-xl text-white leading-relaxed drop-shadow-md">
              Tortas artesanales, catering inclusivo y tazas únicas. Un espacio seguro donde 
              la diversidad se celebra con cada bocado y cada sorbo. Opciones veganas y sin TACC disponibles.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-white drop-shadow-md">
              <Heart className="h-6 w-6" />
              <span className="text-lg font-medium">Hecho con amor y orgullo</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
              <button 
                onClick={handleProductsNavigation}
                className="bg-white text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors flex items-center space-x-2"
              >
                <span>Ver Nuestros Productos</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => onNavigate && onNavigate('contacto')}
                className="bg-white text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors flex items-center justify-center"
              >
                Hacer Pedido
              </button>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">
              ¿Por qué elegir <span className="rainbow-text">Maricafe</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Más que una cafetería, somos un espacio de inclusión y celebración de la diversidad
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4 p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Cake className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Tortas Artesanales</h3>
              <p className="text-sm text-muted-foreground">
                Desde nuestras famosas Rainbow Cakes hasta opciones veganas y sin TACC. 
                Cada torta es una obra de arte comestible.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Catering Inclusivo</h3>
              <p className="text-sm text-muted-foreground">
                Servicio de catering para eventos especiales. Celebramos la diversidad 
                en cada plato que servimos.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Tazas Personalizadas</h3>
              <p className="text-sm text-muted-foreground">
                Tazas únicas con diseños que celebran la identidad y el orgullo. 
                Perfectas para tu café matutino o como regalo especial.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Espacio Seguro</h3>
              <p className="text-sm text-muted-foreground">
                Un lugar donde todos son bienvenidos. Creemos en la inclusión, 
                el respeto y el amor en todas sus formas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="py-16 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 14%, #ff6b9d 28%, #c44569 42%, #f8b500 56%, #ff9ff3 70%, #54a0ff 84%, #5f27cd 100%)'
      }}>
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
              Nuestras <span className="rainbow-text">Tortas</span>
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Conocé algunos de nuestras tortas más destacadas
            </p>
          </div>
          
          {productsPending ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-white/90 drop-shadow-md">Cargando nuestras tortas...</p>
              </div>
            </div>
          ) : cakeProducts.length > 0 ? (
            <CakeCarousel cakes={cakeProducts} onCakeClick={handleCakeClick} />
          ) : (
            <div className="text-center py-12">
              <p className="text-white/90 drop-shadow-md">No se encontraron tortas disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* Nuestro Local Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Nuestro <span className="rainbow-text">Local</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visitanos en nuestro espacio inclusivo y acogedor
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <a 
                href="https://www.google.com/maps/place/Maricaf%C3%A9+-+Caf%C3%A9+%E2%80%A2+Bar+%26+LGBT+BookStore/@-34.5943351,-58.4210023,17z/data=!3m1!4b1!4m6!3m5!1s0x95bccb62920f98fb:0xd36865d11275c69e!8m2!3d-34.5943351!4d-58.4210023!16s%2Fg%2F11g1ppd_6x?entry=ttu&g_ep=EgoyMDI1MTAxOS4wIKXMDSoASAFQAw%3D%3D" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block relative group"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0168936587894!2d-58.4235773!3d-34.594225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb62920f98fb%3A0xd36865d11275c69e!2sMaricaf%C3%A9%20-%20Caf%C3%A9%20%E2%80%A2%20Bar%20%26%20LGBT%20BookStore!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Maricafe"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </a>
              <div className="bg-background p-6 text-center">
                <p className="text-muted-foreground">
                  Hacé click en el mapa para abrir en Google Maps
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              ¿Listo para celebrar la diversidad?
            </h2>
            <p className="text-lg opacity-90">
              Únete a nuestra comunidad y descubre un mundo de sabores inclusivos. 
              Cada producto que creamos es una celebración del amor y la diversidad.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
              <button 
                onClick={handleProductsNavigation}
                className="bg-background text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-background/90 transition-colors"
              >
                Ver Catálogo Completo
              </button>
              <button 
                onClick={() => onNavigate && onNavigate('contacto')}
                className="border border-primary-foreground text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary-foreground/10 transition-colors"
              >
                Contactar Ahora
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
