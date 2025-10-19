import React from 'react'
import { Select, SelectItem } from './ui/Select.jsx'

export default function CategoryFilter({ 
  categories = [], 
  selectedCategory = 'all', 
  onCategoryChange,
  loading = false 
}) {
  const handleCategoryChange = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="category-filter" className="text-sm font-medium text-foreground">
        Filtrar por categoría:
      </label>
      <div className="min-w-[200px]">
        <Select
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          placeholder={loading ? "Cargando..." : "Todas las categorías"}
        >
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}
