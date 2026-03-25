'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Heart, 
  CheckCircle, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Draws', href: '/admin/draws', icon: Trophy },
  { label: 'Charities', href: '/admin/charities', icon: Heart },
  { label: 'Verification', href: '/admin/verification', icon: CheckCircle },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b-2 border-bauhaus-black/10">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-bauhaus-black flex items-center justify-center">
            <Shield className="w-5 h-5 text-bauhaus-yellow" />
          </div>
          <span className="font-display font-bold text-lg">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 font-medium transition-colors',
                    isActive
                      ? 'bg-bauhaus-black text-white'
                      : 'text-bauhaus-black hover:bg-bauhaus-black/5'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Back to User Dashboard */}
      <div className="p-4 border-t-2 border-bauhaus-black/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 w-full font-medium text-bauhaus-blue hover:bg-bauhaus-blue/5 transition-colors"
        >
          <LayoutDashboard className="w-5 h-5" />
          User Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full font-medium text-bauhaus-gray hover:text-bauhaus-red hover:bg-bauhaus-red/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 right-4 z-50 lg:hidden w-14 h-14 bg-bauhaus-black text-bauhaus-yellow flex items-center justify-center shadow-bauhaus-sm"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden"
        >
          <div 
            className="absolute inset-0 bg-bauhaus-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-bauhaus-black flex flex-col"
          >
            <SidebarContent />
          </motion.aside>
        </motion.div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-bauhaus-black flex-col z-30">
        <SidebarContent />
      </aside>
    </>
  )
}
