import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

// Utility function to merge classes
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function Select({ children, value, onValueChange, placeholder = "Seleccionar..." }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)
  const selectRef = useRef(null)

  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  // Evitar listeners globales; cerrar al perder foco del contenedor
  const handleBlur = (event) => {
    if (!selectRef.current) return
    const next = event.relatedTarget
    if (!next || !selectRef.current.contains(next)) {
      // Pequeño delay para permitir clicks en opciones
      setTimeout(() => setIsOpen(false), 100)
    }
  }

  const handleSelect = (newValue) => {
    setSelectedValue(newValue)
    onValueChange(newValue)
    setIsOpen(false)
  }

  const selectedChild = React.Children.toArray(children).find(
    child => child.props.value === selectedValue
  )

  return (
    <div className="relative" ref={selectRef} tabIndex={-1} onBlur={handleBlur}>
      <button
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedValue ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedChild ? selectedChild.props.children : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md">
          {React.Children.map(children, (child) => (
            <button
              key={child.props.value}
              type="button"
              className={cn(
                'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                selectedValue === child.props.value && 'bg-accent text-accent-foreground'
              )}
              onClick={() => handleSelect(child.props.value)}
            >
              {child.props.children}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function SelectContent({ children }) {
  return <>{children}</>
}

export function SelectItem({ children, value }) {
  return <div value={value}>{children}</div>
}

export function SelectTrigger({ children, className, ...props }) {
  return (
    <button
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SelectValue({ placeholder }) {
  return <span>{placeholder}</span>
}
