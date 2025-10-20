import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx'
import { Checkbox } from './ui/Checkbox.jsx'
import { Label } from './ui/Label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select.jsx'
import { Input } from './ui/Input.jsx'
import { Badge } from './ui/Badge.jsx'

export default function AttributeFilter({ 
  attributes = [], 
  attributeFilters = {}, 
  onAttributeFilterChange,
  selectedCategory,
  className = "",
  loading = false
}) {
  const [expandedAttributes, setExpandedAttributes] = useState({})
  const [allAttributes, setAllAttributes] = useState([])
  const [internalLoading, setInternalLoading] = useState(false)

  // Use attributes passed as props (they are already filtered by category in the service)
  useEffect(() => {
    setAllAttributes(attributes)
  }, [attributes])

  const toggleAttributeExpansion = (attributeId) => {
    setExpandedAttributes(prev => ({
      ...prev,
      [attributeId]: !prev[attributeId]
    }))
  }

  const handleFilterChange = (attributeId, value, attributeType) => {
    if (onAttributeFilterChange) {
      onAttributeFilterChange(attributeId, value, attributeType)
    }
  }

  const getFilterValue = (attributeId) => {
    return attributeFilters[attributeId] || null
  }

  const renderAttributeFilter = (attribute) => {
    if (!attribute) return null
    
    const { attribute_id, name, data_type, select_options, required } = attribute
    const currentValue = getFilterValue(attribute_id)
    const isExpanded = expandedAttributes[attribute_id]
    

    const renderFilterInput = () => {
      switch (data_type) {
        case 'boolean':
          return (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${attribute_id}-true`}
                  checked={currentValue === 'true'}
                  onCheckedChange={(checked) => 
                    handleFilterChange(attribute_id, checked ? 'true' : null, data_type)
                  }
                />
                <Label htmlFor={`${attribute_id}-true`} className="text-sm">
                  Sí
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${attribute_id}-false`}
                  checked={currentValue === 'false'}
                  onCheckedChange={(checked) => 
                    handleFilterChange(attribute_id, checked ? 'false' : null, data_type)
                  }
                />
                <Label htmlFor={`${attribute_id}-false`} className="text-sm">
                  No
                </Label>
              </div>
            </div>
          )

        case 'select':
          // Backend provides select_options as an array of strings
          let options = []
          if (select_options) {
            if (Array.isArray(select_options)) {
              options = select_options
              console.log(`AttributeFilter: ${name} options (array):`, options)
            } else if (typeof select_options === 'string') {
              // Fallback for string format (shouldn't happen with current backend)
              options = select_options.split(',').map(option => option.trim())
              console.log(`AttributeFilter: ${name} options (string fallback):`, options)
            }
          } else {
            console.log(`AttributeFilter: ${name} has no select_options`)
          }
          return (
            <Select
              value={currentValue || ''}
              onValueChange={(value) => 
                handleFilterChange(attribute_id, value || null, data_type)
              }
              placeholder={`Seleccionar ${name.toLowerCase()}`}
            >
              <SelectItem value="">Todos</SelectItem>
              {options.length > 0 ? options.map((option, index) => {
                const trimmedOption = option.trim()
                return (
                  <SelectItem key={index} value={trimmedOption}>
                    {trimmedOption}
                  </SelectItem>
                )
              }) : (
                <SelectItem value="no-options" disabled>
                  No hay opciones disponibles
                </SelectItem>
              )}
            </Select>
          )

        case 'number':
          return (
            <div className="space-y-2">
              <Input
                type="number"
                placeholder={`Filtrar por ${name.toLowerCase()}`}
                value={currentValue || ''}
                onChange={(e) => 
                  handleFilterChange(attribute_id, e.target.value || null, data_type)
                }
                className="w-full"
              />
            </div>
          )

        case 'text':
          return (
            <Input
              type="text"
              placeholder={`Filtrar por ${name.toLowerCase()}`}
              value={currentValue || ''}
              onChange={(e) => 
                handleFilterChange(attribute_id, e.target.value || null, data_type)
              }
              className="w-full"
            />
          )

        default:
          return null
      }
    }

    return (
      <div key={attribute_id} className="border-b border-gray-200 pb-3 last:border-b-0">
        <div 
          className="flex items-center justify-between cursor-pointer py-2"
          onClick={() => toggleAttributeExpansion(attribute_id)}
        >
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium cursor-pointer">
              {name}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {currentValue && (
              <Badge variant="secondary" className="text-xs">
                Filtrado
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
        
        {isExpanded && (
          <div className="mt-2">
            {renderFilterInput()}
          </div>
        )}
      </div>
    )
  }

  const clearAllFilters = () => {
    if (onAttributeFilterChange) {
      Object.keys(attributeFilters).forEach(attributeId => {
        onAttributeFilterChange(attributeId, null, null)
      })
    }
  }

  const hasActiveFilters = Object.values(attributeFilters).some(value => value !== null && value !== '')

  if (loading || internalLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Filtros por Atributos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Cargando atributos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (attributes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Filtros por Atributos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            {selectedCategory === 'all' 
              ? 'Selecciona una categoría para ver filtros específicos'
              : 'No hay atributos disponibles para esta categoría'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros por Atributos</CardTitle>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:text-primary/80 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        {selectedCategory !== 'all' && (
          <p className="text-sm text-gray-500">
            Filtros específicos para esta categoría
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {attributes && attributes.length > 0 ? attributes.map(renderAttributeFilter) : null}
      </CardContent>
    </Card>
  )
}
