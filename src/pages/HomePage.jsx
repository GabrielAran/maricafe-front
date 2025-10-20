import React from 'react'
import { Cake, Gift, Users, Heart, ArrowRight } from 'lucide-react'

export default function HomePage({ onNavigate }) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <img
                src="/maricafe-logo-oficial.png"
                alt="Maricafe"
                width={60}
                height={60}
                className="rounded-full"
              />
              <h1 className="text-4xl lg:text-6xl font-bold">
                <span className="rainbow-text">Maricafe</span>
              </h1>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-semibold text-foreground">
              Cafetería LGBT+ Especializada
            </h2>
            
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Tortas artesanales, catering inclusivo y tazas únicas. Un espacio seguro donde 
              la diversidad se celebra con cada bocado y cada sorbo. Opciones veganas y sin TACC disponibles.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-primary">
              <Heart className="h-6 w-6" />
              <span className="text-lg font-medium">Hecho con amor y orgullo</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
              <button 
                onClick={() => onNavigate && onNavigate('productos')}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <span>Ver Nuestros Productos</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => onNavigate && onNavigate('contacto')}
                className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary/10 transition-colors"
              >
                Hacer Pedido
              </button>
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
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Nuestros <span className="rainbow-text">Productos</span> Destacados
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestras creaciones más populares, hechas con ingredientes premium y mucho amor
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Rainbow Cake */}
            <div className="bg-background rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="/rainbow-cake-colorful-layers.jpg"
                alt="Rainbow Cake"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold">Rainbow Cake Clásica</h3>
                <p className="text-sm text-muted-foreground">
                  Nuestra torta insignia con 6 capas de colores del arcoíris y crema de vainilla suave.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">$65.000</span>
                  <button 
                    onClick={() => onNavigate && onNavigate('productos')}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
            
            {/* Taza Pride */}
            <div className="bg-background rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="/pride-mug-love-is-love-rainbow.jpg"
                alt="Taza Pride"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold">Taza Pride "Love is Love"</h3>
                <p className="text-sm text-muted-foreground">
                  Taza de cerámica premium con diseño arcoíris y mensaje de amor inclusivo.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">$8.500</span>
                  <button 
                    onClick={() => onNavigate && onNavigate('productos')}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
            
            {/* Catering */}
            <div className="bg-background rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="/pride-themed-catering-rainbow-decorations-premium.jpg"
                alt="Catering Pride"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold">Catering Pride Premium</h3>
                <p className="text-sm text-muted-foreground">
                  Servicio completo de catering para eventos especiales con decoración temática.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">Desde $150.000</span>
                  <button 
                    onClick={() => onNavigate && onNavigate('catering')}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Consultar
                  </button>
                </div>
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
                onClick={() => onNavigate && onNavigate('productos')}
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
