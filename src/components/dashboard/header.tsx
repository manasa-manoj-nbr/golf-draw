'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, User as UserIcon } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { User } from '@/types'

interface DashboardHeaderProps {
  user: User | null
}

interface SubscriptionData {
  status: string
  plan_type: string
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/subscription')
        const data = await res.json()
        if (data.subscription) {
          setSubscription(data.subscription)
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  const isActive = subscription?.status === 'active'

  return (
    <header className="sticky top-0 z-20 bg-white border-b-2 border-bauhaus-black lg:ml-64">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Welcome */}
        <div>
          <h1 className="text-xl font-bold">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Golfer'}!
          </h1>
          {!isLoading && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isActive ? 'success' : 'error'} size="sm">
                {isActive ? 'Active Subscriber' : 'No Subscription'}
              </Badge>
              {subscription?.plan_type && (
                <Badge variant="info" size="sm">
                  {subscription.plan_type === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-bauhaus-black/5 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-bauhaus-red rounded-full" />
          </button>
          
          <Link href="/dashboard/settings">
            <div className="flex items-center gap-3 p-2 hover:bg-bauhaus-black/5 transition-colors">
              <div className="w-10 h-10 bg-bauhaus-blue rounded-full flex items-center justify-center text-white font-bold">
                {user?.full_name?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5" />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-medium text-sm">{user?.full_name || 'User'}</p>
                <p className="text-xs text-bauhaus-gray">{user?.email}</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
