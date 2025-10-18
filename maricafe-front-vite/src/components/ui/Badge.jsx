import React from 'react'

// Utility function to merge classes
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Badge({ 
  children, 
  variant = 'default', 
  className = '',
  ...props 
}) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input bg-background text-foreground'
  }
  
  const classes = cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variants[variant],
    className
  )
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
