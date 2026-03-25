'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Charities', href: '/charities' },
  { label: 'Pricing', href: '/pricing' },
]

interface HeaderProps {
  user?: { email: string } | null
}

export function Header({ user: initialUser }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(initialUser)
  const pathname = usePathname()
  const router = useRouter()

  // Check auth state on mount if no initial user provided
  useEffect(() => {
    if (initialUser === undefined) {
      const checkAuth = async () => {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser ? { email: authUser.email || '' } : null)
      }
      checkAuth()
    }
  }, [initialUser])

  const handleSubscribe = () => {
    if (user) {
      router.push('/checkout?plan=yearly')
    } else {
      router.push('/signup?plan=yearly')
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-bauhaus-white border-b-2 border-bauhaus-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-bauhaus-red rounded-full" />
              <div className="w-4 h-4 bg-bauhaus-blue rounded-full" />
              <div className="w-4 h-4 bg-bauhaus-yellow rounded-full" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              GolfDraw
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'font-medium transition-colors',
                  pathname === item.href
                    ? 'text-bauhaus-red'
                    : 'text-bauhaus-black hover:text-bauhaus-red'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Button variant="primary" size="sm" onClick={handleSubscribe}>
                  Subscribe Now
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-bauhaus-black/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t-2 border-bauhaus-black bg-bauhaus-white"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'p-3 font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-bauhaus-red text-white'
                      : 'hover:bg-bauhaus-black/5'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t-2 border-bauhaus-black/10 pt-4 mt-2 flex flex-col gap-2">
                {user ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Log In
                      </Button>
                    </Link>
                    <Button variant="primary" className="w-full" onClick={handleSubscribe}>
                      Subscribe Now
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
