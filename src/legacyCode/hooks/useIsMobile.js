import { useState, useEffect } from 'react'

// Hook para detectar si es móvil usando CSS media queries
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Usar matchMedia en lugar de window.innerWidth
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    
    const handleChange = (e) => {
      setIsMobile(e.matches)
    }
    
    // Verificar estado inicial
    setIsMobile(mediaQuery.matches)
    
    // Escuchar cambios
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isMobile
}
