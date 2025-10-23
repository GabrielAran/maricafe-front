import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react"

export default function ContactoPage() {
  return (
    <div className="px-4 py-12 md:px-8 lg:px-16 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Información de contacto */}
          <div className="p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-fuchsia-700 mb-4">
              <MapPin className="w-5 h-5" />
              Información de contacto
            </h2>

            <div className="space-y-5 text-sm">
              <div>
                <div className="flex items-center gap-2 text-fuchsia-600">
                  <Phone className="w-4 h-4" />
                  <h3 className="font-semibold text-gray-900">Teléfono</h3>
                </div>
                <p className="ml-6 text-gray-700">+54 11 2277-7434</p>
                <p className="ml-6 text-xs text-gray-500">WhatsApp disponible</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-fuchsia-600">
                  <Mail className="w-4 h-4" />
                  <h3 className="font-semibold text-gray-900">Email</h3>
                </div>
                <p className="ml-6 text-gray-700">contacto@maricafe.com</p>
                <p className="ml-6 text-xs text-gray-500">Respondemos en 24hs</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-fuchsia-600">
                  <MapPin className="w-4 h-4" />
                  <h3 className="font-semibold text-gray-900">Ubicación</h3>
                </div>
                <p className="ml-6 text-gray-700">Honduras 4096, Palermo, Buenos Aires</p>
                <p className="ml-6 text-xs text-gray-500">Argentina</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-fuchsia-600">
                  <Clock className="w-4 h-4" />
                  <h3 className="font-semibold text-gray-900">Horarios</h3>
                </div>
                <p className="ml-6 text-gray-700">Lun - Vie: 9:00 - 18:00</p>
                <p className="ml-6 text-gray-700">Sáb: 10:00 - 22:00</p>
                <p className="ml-6 text-gray-700">Dom: Cerrado</p>
              </div>
            </div>
          </div>

          {/* Síguenos en redes */}
          <div className="p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Síguenos en redes</h2>
            <div className="space-y-6">
              <div className="flex gap-6">
                <a
                  href="https://www.facebook.com/maricafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-fuchsia-300 text-fuchsia-600 hover:bg-fuchsia-50 transition-colors flex-1"
                >
                  <Facebook className="w-8 h-8" />
                  <span className="font-medium">Facebook</span>
                </a>
                <a
                  href="https://www.instagram.com/maricafeok/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-fuchsia-300 text-fuchsia-600 hover:bg-fuchsia-50 transition-colors flex-1"
                >
                  <Instagram className="w-8 h-8" />
                  <span className="font-medium">Instagram</span>
                </a>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Síguenos para ver nuestras últimas creaciones y ofertas especiales.
              </p>
            </div>
          </div>
        </div>

        {/* Sección ¿Sabías que...? */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="bg-fuchsia-50 p-6 rounded-2xl border border-fuchsia-100">
            <h2 className="text-fuchsia-700 text-lg font-semibold mb-3">¿Sabías que…?</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Ofrecemos descuentos especiales para eventos comunitarios LGBT+</li>
              <li>Todas nuestras tortas pueden personalizarse</li>
              <li>Hacemos entregas en CABA y GBA</li>
              <li>Aceptamos pedidos con 48hs de anticipación</li>
            </ul>
          </div>
        </div>

        {/* Preguntas frecuentes */}
        <div className="max-w-6xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">Preguntas frecuentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">¿Hacen entregas a domicilio?</h3>
              <p className="text-gray-700">
                Sí, realizamos entregas en CABA y GBA. El costo de envío se calcula según la distancia y se informa al momento de la compra.
              </p>
            </div>

            <div className="p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">¿Con cuánta anticipación debo hacer mi pedido?</h3>
              <p className="text-gray-700">
                Recomendamos hacer pedidos con al menos 48–72 horas de anticipación para garantizar disponibilidad y frescura.
              </p>
            </div>

            <div className="p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">¿Pueden personalizar las tortas?</h3>
              <p className="text-gray-700">
                ¡Por supuesto! Nos especializamos en tortas personalizadas. Contáctanos para discutir tu diseño ideal y presupuesto.
              </p>
            </div>

            <div className="p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-gray-700">
                Aceptamos efectivo, transferencias bancarias, tarjetas de débito y crédito, y billeteras virtuales como Mercado Pago.
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}