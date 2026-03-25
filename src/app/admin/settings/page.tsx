'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Bell,
  DollarSign,
  Calendar,
  Shield,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PRICING, PRIZE_DISTRIBUTION, SUBSCRIPTION_POOL_PERCENTAGE, MIN_CHARITY_PERCENTAGE, PLATFORM_PERCENTAGE } from '@/types'

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [settings, setSettings] = useState({
    drawDay: 1,
    drawTime: '12:00',
    defaultDrawType: 'random' as 'random' | 'algorithmic',
    notifyWinners: true,
    notifySubscribers: true,
    autoPublishDraws: false,
  })

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        const data = await res.json()
        if (data.settings) {
          setSettings({
            drawDay: data.settings.draw_day === 'last_friday' ? 1 : parseInt(data.settings.draw_day) || 1,
            drawTime: data.settings.draw_time || '12:00',
            defaultDrawType: data.settings.default_draw_type || 'random',
            notifyWinners: data.settings.winner_notifications ?? true,
            notifySubscribers: data.settings.email_notifications ?? true,
            autoPublishDraws: data.settings.auto_publish_results ?? false,
          })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draw_day: settings.drawDay,
          draw_time: settings.drawTime,
          default_draw_type: settings.defaultDrawType,
          auto_publish_results: settings.autoPublishDraws,
          winner_notifications: settings.notifyWinners,
          email_notifications: settings.notifySubscribers,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save settings' })
    } finally {
      setIsSaving(false)
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-bauhaus-blue border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-bauhaus-black">
          Admin Settings
        </h1>
        <p className="mt-2 text-bauhaus-gray">
          Configure platform settings and preferences
        </p>
      </div>

      {/* Pricing Overview (Read Only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border-2 border-bauhaus-black/10">
              <h4 className="font-bold mb-4">Subscription Plans</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Monthly Plan</span>
                  <span className="font-bold">${PRICING.monthly.amount}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Yearly Plan</span>
                  <span className="font-bold">${PRICING.yearly.amount}/yr</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-2 border-bauhaus-black/10">
              <h4 className="font-bold mb-4">Revenue Distribution</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Prize Pool</span>
                  <span className="font-bold">{SUBSCRIPTION_POOL_PERCENTAGE * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Min Charity Contribution</span>
                  <span className="font-bold">{MIN_CHARITY_PERCENTAGE * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Revenue</span>
                  <span className="font-bold">{PLATFORM_PERCENTAGE * 100}%</span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-bauhaus-gray">
            * Pricing changes require code updates and Stripe configuration.
          </p>
        </CardContent>
      </Card>

      {/* Prize Distribution (Read Only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Prize Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-bauhaus-yellow/20 border-2 border-bauhaus-yellow text-center">
              <p className="text-sm text-bauhaus-gray">5-Match Jackpot</p>
              <p className="text-2xl font-bold mt-1">{PRIZE_DISTRIBUTION.five_match * 100}%</p>
              <p className="text-xs text-bauhaus-gray mt-1">+ rollover</p>
            </div>
            <div className="p-4 bg-bauhaus-blue/20 border-2 border-bauhaus-blue text-center">
              <p className="text-sm text-bauhaus-gray">4-Match Prize</p>
              <p className="text-2xl font-bold mt-1">{PRIZE_DISTRIBUTION.four_match * 100}%</p>
            </div>
            <div className="p-4 bg-bauhaus-red/20 border-2 border-bauhaus-red text-center">
              <p className="text-sm text-bauhaus-gray">3-Match Prize</p>
              <p className="text-2xl font-bold mt-1">{PRIZE_DISTRIBUTION.three_match * 100}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Draw Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Draw Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold mb-2">Draw Day of Month</label>
              <Input
                type="number"
                min={1}
                max={28}
                value={settings.drawDay}
                onChange={(e) => setSettings(prev => ({ ...prev, drawDay: parseInt(e.target.value) }))}
              />
              <p className="text-sm text-bauhaus-gray mt-1">Day 1-28 to avoid month-end issues</p>
            </div>
            <div>
              <label className="block font-bold mb-2">Draw Time (UTC)</label>
              <Input
                type="time"
                value={settings.drawTime}
                onChange={(e) => setSettings(prev => ({ ...prev, drawTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Default Draw Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="drawType"
                    checked={settings.defaultDrawType === 'random'}
                    onChange={() => setSettings(prev => ({ ...prev, defaultDrawType: 'random' }))}
                    className="w-4 h-4 accent-bauhaus-blue"
                  />
                  <span>Random</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="drawType"
                    checked={settings.defaultDrawType === 'algorithmic'}
                    onChange={() => setSettings(prev => ({ ...prev, defaultDrawType: 'algorithmic' }))}
                    className="w-4 h-4 accent-bauhaus-yellow"
                  />
                  <span>Algorithmic</span>
                </label>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoPublishDraws}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoPublishDraws: e.target.checked }))}
                  className="w-5 h-5 accent-bauhaus-green"
                />
                <span className="font-medium">Auto-publish draws after execution</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-bauhaus-black/10 hover:border-bauhaus-black/30 transition-colors">
              <input
                type="checkbox"
                checked={settings.notifyWinners}
                onChange={(e) => setSettings(prev => ({ ...prev, notifyWinners: e.target.checked }))}
                className="w-5 h-5 accent-bauhaus-green"
              />
              <div>
                <span className="font-medium block">Notify Winners</span>
                <span className="text-sm text-bauhaus-gray">Send email to winners after draw</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-bauhaus-black/10 hover:border-bauhaus-black/30 transition-colors">
              <input
                type="checkbox"
                checked={settings.notifySubscribers}
                onChange={(e) => setSettings(prev => ({ ...prev, notifySubscribers: e.target.checked }))}
                className="w-5 h-5 accent-bauhaus-green"
              />
              <div>
                <span className="font-medium block">Notify All Subscribers</span>
                <span className="text-sm text-bauhaus-gray">Send draw results to all active subscribers</span>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        {saveMessage && (
          <div className={`flex items-center gap-2 ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
