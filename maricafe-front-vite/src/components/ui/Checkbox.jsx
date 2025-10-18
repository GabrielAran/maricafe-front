import React from 'react'
import { Check } from 'lucide-react'

// Utility function to merge classes
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Checkbox({ 
  checked = false, 
  onCheckedChange, 
  className = '',
  id,
  ...props 
}) {
  const handleChange = (event) => {
    onCheckedChange(event.target.checked)
  }

  return (
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        className="sr-only"
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          checked && 'bg-primary text-primary-foreground',
          className
        )}
      >
        {checked && (
          <Check className="h-4 w-4" />
        )}
      </label>
    </div>
  )
}
