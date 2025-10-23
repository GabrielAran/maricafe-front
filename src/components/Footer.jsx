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
                src="/LOGO_Maricafe_Circular.png"
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

          {/* Centro: Contacto */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Honduras 4096, Palermo, Buenos Aires
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">+54 11 2277-7434</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">contacto@maricafe.com</span>
              </div>
            </div>
          </div>

          {/* Horarios a la derecha */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Horarios</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Lun - Vie: 9:00 - 18:00</div>
              <div>Sáb: 10:00 - 22:00</div>
              <div>Dom: Cerrado</div>
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
