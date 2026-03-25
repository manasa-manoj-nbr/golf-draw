'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, CreditCard, Bell, LogOut, Save, ExternalLink, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, toast } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User as UserType, Subscription } from '@/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserType | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isManagingSubscription, setIsManagingSubscription] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)
      setSubscription(subData)
      setFullName(profileData?.full_name || '')
    }

    setIsLoading(false)
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated!')
    } catch (error: any) {
      toast.error('Failed to save', error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleManageSubscription = async (action: 'portal' | 'cancel' | 'reactivate') => {
    setIsManagingSubscription(true)

    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      if (action === 'portal' && data.url) {
        window.location.href = data.url
      } else {
        toast.success(
          action === 'cancel' 
            ? 'Subscription will be canceled at period end' 
            : 'Subscription reactivated!'
        )
        fetchData()
      }
    } catch (error: any) {
      toast.error('Failed to manage subscription', error.message)
    } finally {
      setIsManagingSubscription(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-bauhaus-red border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-bauhaus-gray">
          Manage your account settings and subscription.
        </p>
      </div>

      {/* Profile */}
      <Card hover={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
            />
            <Input
              label="Email"
              value={profile?.email || ''}
              disabled
              hint="Email cannot be changed"
            />
          </div>
          
          <Button onClick={handleSaveProfile} isLoading={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card hover={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription && subscription.status === 'active' ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-bauhaus-black/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold">
                      {subscription.plan_type === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
                    </p>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="text-sm text-bauhaus-gray">
                    {subscription.plan_type === 'yearly' 
                      ? `${formatCurrency(129)}/year`
                      : `${formatCurrency(14.99)}/month`
                    }
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-bauhaus-gray">
                    {subscription.cancel_at_period_end ? 'Cancels on' : 'Renews on'}
                  </p>
                  <p className="font-bold">
                    {subscription.current_period_end 
                      ? formatDate(subscription.current_period_end)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="p-4 bg-bauhaus-yellow border-2 border-bauhaus-black">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Subscription Ending</p>
                      <p className="text-sm">
                        Your subscription will end on {formatDate(subscription.current_period_end!)}.
                        You can reactivate anytime before then.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleManageSubscription('portal')}
                  isLoading={isManagingSubscription}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>

                {subscription.cancel_at_period_end ? (
                  <Button
                    variant="secondary"
                    onClick={() => handleManageSubscription('reactivate')}
                    isLoading={isManagingSubscription}
                  >
                    Reactivate Subscription
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => handleManageSubscription('cancel')}
                    isLoading={isManagingSubscription}
                    className="text-bauhaus-red hover:bg-bauhaus-red/10"
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-bauhaus-gray mx-auto mb-4" />
              <p className="text-bauhaus-gray mb-4">No active subscription</p>
              <Button onClick={() => window.location.href = '/pricing'}>
                Subscribe Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card hover={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Draw Results', description: 'Get notified when monthly draw results are published', enabled: true },
              { label: 'Win Notifications', description: 'Instant alerts when you win a prize', enabled: true },
              { label: 'Subscription Reminders', description: 'Reminders about subscription renewals', enabled: true },
              { label: 'Marketing', description: 'News, updates, and special offers', enabled: false },
            ].map((notification) => (
              <div
                key={notification.label}
                className="flex items-center justify-between p-4 bg-bauhaus-black/5"
              >
                <div>
                  <p className="font-medium">{notification.label}</p>
                  <p className="text-sm text-bauhaus-gray">{notification.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={notification.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-bauhaus-gray/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-bauhaus-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bauhaus-blue"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card hover={false} className="border-bauhaus-red">
        <CardHeader>
          <CardTitle className="text-bauhaus-red">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Log Out</p>
              <p className="text-sm text-bauhaus-gray">Sign out of your account on this device</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
