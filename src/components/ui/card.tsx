'use client'

import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'red' | 'blue' | 'yellow'
  hover?: boolean
}

export function Card({ children, className, variant = 'default', hover = true }: CardProps) {
  const shadows = {
    default: 'shadow-bauhaus',
    red: 'shadow-bauhaus-red',
    blue: 'shadow-bauhaus-blue',
    yellow: 'shadow-bauhaus-yellow',
  }

  return (
    <div
      className={cn(
        'bg-white border-2 border-bauhaus-black p-6',
        shadows[variant],
        hover && 'transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-bauhaus-lg',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-bold text-bauhaus-black', className)}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-bauhaus-gray mt-1', className)}>
      {children}
    </p>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t-2 border-bauhaus-black/10', className)}>
      {children}
    </div>
  )
}
