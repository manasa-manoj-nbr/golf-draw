'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ScoreBallProps {
  score: number
  color?: 'red' | 'blue' | 'yellow' | 'white'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export function ScoreBall({ 
  score, 
  color = 'red', 
  size = 'md',
  animated = false,
  className 
}: ScoreBallProps) {
  const colors = {
    red: 'bg-bauhaus-red text-white',
    blue: 'bg-bauhaus-blue text-white',
    yellow: 'bg-bauhaus-yellow text-bauhaus-black',
    white: 'bg-white text-bauhaus-black',
  }

  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-3xl',
  }

  const Ball = animated ? motion.div : 'div'

  const animationProps = animated ? {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: 'spring', stiffness: 200, damping: 15 }
  } : {}

  return (
    <Ball
      className={cn(
        'rounded-full flex items-center justify-center font-bold border-2 border-bauhaus-black shadow-bauhaus-sm',
        colors[color],
        sizes[size],
        className
      )}
      {...animationProps}
    >
      {score}
    </Ball>
  )
}

interface ScoreBallGroupProps {
  scores: number[]
  animated?: boolean
  staggerDelay?: number
}

export function ScoreBallGroup({ scores, animated = false, staggerDelay = 0.1 }: ScoreBallGroupProps) {
  const colors: ('red' | 'blue' | 'yellow')[] = ['red', 'blue', 'yellow', 'red', 'blue']

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {scores.map((score, index) => (
        <motion.div
          key={index}
          initial={animated ? { opacity: 0, y: 20 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={animated ? { delay: index * staggerDelay } : undefined}
        >
          <ScoreBall 
            score={score} 
            color={colors[index % colors.length]} 
          />
        </motion.div>
      ))}
    </div>
  )
}
