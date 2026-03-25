import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return formatShortDate(date)
}

export function getNextDrawDate(): Date {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  // Draw on the last day of each month
  return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0)
}

export function daysUntilDraw(): number {
  const now = new Date()
  const drawDate = getNextDrawDate()
  return Math.ceil((drawDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function calculatePrizePool(subscriberCount: number, monthlyPrice: number = 14.99): {
  total: number
  fiveMatch: number
  fourMatch: number
  threeMatch: number
} {
  const poolPercentage = 0.50
  const total = subscriberCount * monthlyPrice * poolPercentage
  
  return {
    total,
    fiveMatch: total * 0.40,
    fourMatch: total * 0.35,
    threeMatch: total * 0.25,
  }
}

export function calculateCharityContribution(
  subscriptionAmount: number,
  charityPercentage: number
): number {
  return subscriptionAmount * (charityPercentage / 100)
}

export function validateScore(score: number): boolean {
  return score >= 1 && score <= 45 && Number.isInteger(score)
}

export function generateRandomNumbers(count: number = 5, min: number = 1, max: number = 45): number[] {
  const numbers: Set<number> = new Set()
  while (numbers.size < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min
    numbers.add(num)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

export function countMatchingNumbers(userScores: number[], winningNumbers: number[]): number {
  const userSet = new Set(userScores)
  return winningNumbers.filter(n => userSet.has(n)).length
}

export function getMatchType(matchCount: number): 'five_match' | 'four_match' | 'three_match' | null {
  if (matchCount === 5) return 'five_match'
  if (matchCount === 4) return 'four_match'
  if (matchCount === 3) return 'three_match'
  return null
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
