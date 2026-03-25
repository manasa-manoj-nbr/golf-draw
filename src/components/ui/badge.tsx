'use client'

import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variants = {
    default: 'bg-bauhaus-black text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-bauhaus-yellow text-bauhaus-black',
    error: 'bg-bauhaus-red text-white',
    info: 'bg-bauhaus-blue text-white',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold border-2 border-bauhaus-black',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
