import React from 'react'
import { Select, SelectItem } from './ui/Select.jsx'

export default function PriceSort({ 
  sortOptions = [], 
  selectedSort = 'featured', 
  onSortChange,
  loading = false 
}) {
  const handleSortChange = (sortValue) => {
    if (onSortChange) {
      onSortChange(sortValue)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="price-sort" className="text-sm font-medium text-foreground">
        Ordenar por:
      </label>
      <div className="min-w-[200px]">
        <Select
          value={selectedSort}
          onValueChange={handleSortChange}
          placeholder={loading ? "Cargando..." : "Seleccionar orden"}
        >
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}
