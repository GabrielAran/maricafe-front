import React from 'react'
import ProductViewNew from '../components/ProductViewNew.jsx'

export default function ProductosPage({ onNavigate }) {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold">
          Nuestros <span className="rainbow-text">Productos</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Descubre nuestra selección de productos artesanales, desde tortas rainbow hasta tazas personalizadas. 
          Cada producto está hecho con amor y celebra la diversidad.
        </p>
      </div>

      <ProductViewNew 
        showCategoryFilter={true} 
        showSorting={true} 
        showFilters={true} 
        onNavigate={onNavigate}
      />
    </div>
  )
}