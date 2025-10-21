import React from 'react'
import { Cake, Gift, Users, Heart, ArrowRight } from 'lucide-react'

export default function HomePage({ onNavigate }) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20" style={{
        background: 'linear-gradient(135deg, #FF0018 0%, #FFA52C 16.67%, #FFFF41 33.33%, #008018 50%, #0000F9 66.67%, #86007D 83.33%, #FF0018 100%)'
      }}>
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
            
            <h2 className="text-2xl lg:text-3xl font-semibold text-white">
              Cafetería LGBT+ Especializada
            </h2>
            
            <p className="text-lg lg:text-xl text-white max-w-3xl mx-auto leading-relaxed">
              Tortas artesanales, catering inclusivo y tazas únicas. Un espacio seguro donde 
              la diversidad se celebra con cada bocado y cada sorbo. Opciones veganas y sin TACC disponibles.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-white">
              <Heart className="h-6 w-6" />
              <span className="text-lg font-medium">Hecho con amor y orgullo</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
              <button 
                onClick={() => onNavigate && onNavigate('productos')}
                className="bg-white text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors flex items-center space-x-2"
              >
                <span>Ver Nuestros Productos</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => onNavigate && onNavigate('contacto')}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
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
              Nuestras <span className="rainbow-text">Tortas</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conocé algunos de nuestras tortas más destacadas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Rainbow Cake */}
            <div className="bg-background rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="/rainbow-cake-colorful-layers.jpg"
                alt="Rainbow Cake"
                className="w-full h-64 object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold">Rainbow Cake</h3>
                <p className="text-sm text-muted-foreground">
                  Nuestra torta insignia con 6 capas de colores del arcoíris y crema de vainilla suave.
                </p>
              </div>
            </div>
            
            {/* Red Velvet */}
            <div className="bg-background rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="/red-velvet-cake-with-rainbow-decoration.jpg"
                alt="Red Velvet Cake"
                className="w-full h-64 object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold">Red Velvet con Decoración Arcoíris</h3>
                <p className="text-sm text-muted-foreground">
                  Clásica torta red velvet con un toque especial de decoración arcoíris que celebra la diversidad.
                </p>
              </div>
            </div>
            
            {/* Carrot Cake */}
            <div className="bg-background rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="/carrot-cake-cream-cheese.png"
                alt="Carrot Cake"
                className="w-full h-64 object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold">Carrot Cake</h3>
                <p className="text-sm text-muted-foreground">
                  Deliciosa torta de zanahoria con frosting de queso crema, perfecta para cualquier ocasión.
                </p>
              </div>
            </div>
          </div>
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
                href="https://maps.app.goo.gl/kAcPQjqXRcHBwut88?g_st=iw" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block relative group"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0168936587894!2d-58.38375908477273!3d-34.603722980458976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzEzLjQiUyA1OMKwMjInNTIuOSJX!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar"
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
