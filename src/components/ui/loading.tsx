'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'red' | 'blue' | 'yellow' | 'black' | 'white'
  className?: string
}

export function Spinner({ size = 'md', color = 'red', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const colors = {
    red: 'border-bauhaus-red',
    blue: 'border-bauhaus-blue',
    yellow: 'border-bauhaus-yellow',
    black: 'border-bauhaus-black',
    white: 'border-white',
  }

  return (
    <div
      className={cn(
        'border-4 border-t-transparent rounded-full animate-spin',
        sizes[size],
        colors[color],
        className
      )}
    />
  )
}

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-bauhaus-white flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            className="w-4 h-4 bg-bauhaus-red rounded-full mx-1"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-4 h-4 bg-bauhaus-blue rounded-full mx-1"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
          />
          <motion.div
            className="w-4 h-4 bg-bauhaus-yellow rounded-full mx-1"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
        <p className="text-bauhaus-gray font-medium">{message}</p>
      </motion.div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-bauhaus-light-gray',
        className
      )}
    />
  )
}
