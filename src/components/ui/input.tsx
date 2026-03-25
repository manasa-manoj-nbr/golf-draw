'use client'

import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, type = 'text', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-bold text-bauhaus-black mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 border-2 border-bauhaus-black bg-white text-bauhaus-black placeholder:text-bauhaus-gray',
            'focus:outline-none focus:ring-2 focus:ring-bauhaus-blue focus:ring-offset-2 transition-all',
            error && 'border-bauhaus-red focus:ring-bauhaus-red',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-sm text-bauhaus-gray">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-bauhaus-red font-medium">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
