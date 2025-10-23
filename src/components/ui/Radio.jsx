import React from 'react'

// Utility function to merge classes
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function Radio({ 
  checked = false, 
  onCheckedChange, 
  className = '',
  id,
  name,
  value,
  ...props 
}) {
  const handleChange = (event) => {
    onCheckedChange(event.target.checked)
  }

  return (
    <div className="flex items-center">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
        className={cn(
          'h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2',
          className
        )}
        {...props}
      />
    </div>
  )
}

// Default export for backward compatibility
export default Radio
