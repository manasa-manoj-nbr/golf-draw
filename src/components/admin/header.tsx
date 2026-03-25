'use client'

import { User } from '@/types'
import { Bell, Shield } from 'lucide-react'

interface AdminHeaderProps {
  user: User | null
  pendingVerifications?: number
}

export function AdminHeader({ user, pendingVerifications = 0 }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-bauhaus-black border-b-2 border-bauhaus-yellow lg:ml-64">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-bauhaus-yellow" />
          <h1 className="text-lg font-display font-bold text-white">
            Admin Control Panel
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-white hover:text-bauhaus-yellow transition-colors">
            <Bell className="w-5 h-5" />
            {pendingVerifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-bauhaus-red text-white text-xs font-bold flex items-center justify-center">
                {pendingVerifications > 9 ? '9+' : pendingVerifications}
              </span>
            )}
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-bauhaus-yellow flex items-center justify-center">
              <span className="font-bold text-bauhaus-black text-sm">
                {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">
                {user?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-bauhaus-yellow">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
