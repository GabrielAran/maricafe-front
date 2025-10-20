import React from 'react'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la empresa */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/maricafe-logo-oficial.png"
                alt="Maricafe"
                width={32}
                height={32}
                className="rounded-full"
              />
              <h3 className="text-xl font-bold rainbow-text">Maricafe</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cafetería LGBT+ especializada en tortas artesanales, catering inclusivo y tazas únicas. 
              Creemos en la diversidad, la inclusión y el amor en todas sus formas.
            </p>
            <div className="flex items-center space-x-2 text-primary">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Hecho con amor y orgullo</span>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Enlaces Rápidos</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#productos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Nuestros Productos
              </a>
              <a href="#tortas" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Tortas Artesanales
              </a>
              <a href="#catering" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Servicio de Catering
              </a>
              <a href="#tazas" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Tazas Personalizadas
              </a>
              <a href="#contacto" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contacto
              </a>
            </nav>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Av. Corrientes 1234, Buenos Aires
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  +54 11 1234-5678
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  hola@maricafe.com
                </span>
              </div>
            </div>
            
            {/* Horarios */}
            <div className="pt-4 border-t">
              <h5 className="font-medium text-foreground mb-2">Horarios</h5>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Lunes - Viernes: 8:00 - 20:00</div>
                <div>Sábados: 9:00 - 22:00</div>
                <div>Domingos: 10:00 - 18:00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 Maricafe. Todos los derechos reservados.
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Espacio seguro para la comunidad LGBT+</span>
              <div className="flex space-x-1">
                <span className="text-lg">🏳️‍🌈</span>
                <span className="text-lg">❤️</span>
                <span className="text-lg">🏳️‍⚧️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
