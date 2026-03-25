'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Heart, Check, ExternalLink, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, toast } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Charity, User } from '@/types'

export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null)
  const [charityPercentage, setCharityPercentage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    
    // Fetch charities
    const { data: charitiesData } = await supabase
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })

    // Fetch user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('charity_id, charity_percentage')
        .eq('id', user.id)
        .single()

      if (profile) {
        setSelectedCharity(profile.charity_id)
        setCharityPercentage(profile.charity_percentage || 10)
      }
    }

    setCharities(charitiesData || [])
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('users')
        .update({
          charity_id: selectedCharity,
          charity_percentage: charityPercentage,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Charity preferences saved!')
    } catch (error: any) {
      toast.error('Failed to save', error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredCharities = charities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCharityData = charities.find(c => c.id === selectedCharity)

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
        <h1 className="text-2xl font-bold">My Charity</h1>
        <p className="text-bauhaus-gray">
          Choose a charity to support with your subscription. At least 10% of your subscription goes directly to them.
        </p>
      </div>

      {/* Current Selection */}
      {selectedCharityData && (
        <Card variant="blue" hover={false}>
          <CardContent className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-full md:w-32 h-32 bg-white/20 rounded-lg overflow-hidden flex-shrink-0">
              {selectedCharityData.image_url && (
                <Image
                  src={selectedCharityData.image_url}
                  alt={selectedCharityData.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-bauhaus-red fill-bauhaus-red" />
                <span className="text-sm font-medium">Your Selected Charity</span>
              </div>
              <h2 className="text-xl font-bold mb-2">{selectedCharityData.name}</h2>
              <p className="text-sm text-bauhaus-gray mb-4">
                {selectedCharityData.description}
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="success" className="text-lg px-4 py-2">
                  {charityPercentage}% of subscription
                </Badge>
                {selectedCharityData.website && (
                  <a
                    href={selectedCharityData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-bauhaus-blue hover:underline flex items-center gap-1"
                  >
                    Visit website <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contribution Slider */}
      <Card hover={false}>
        <CardHeader>
          <CardTitle>Your Contribution Percentage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-bauhaus-gray mb-4">
            The minimum contribution is 10%, but you can choose to give more.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={charityPercentage}
                onChange={(e) => setCharityPercentage(parseInt(e.target.value))}
                className="flex-1 h-2 bg-bauhaus-light-gray rounded-none appearance-none cursor-pointer accent-bauhaus-red"
              />
              <span className="w-16 text-center font-bold text-xl">{charityPercentage}%</span>
            </div>
            
            <div className="flex justify-between text-sm text-bauhaus-gray">
              <span>10% (Minimum)</span>
              <span>50%</span>
            </div>

            <div className="p-4 bg-bauhaus-black/5">
              <p className="text-sm">
                With a <strong>${charityPercentage === 10 ? '14.99' : '14.99'}</strong> monthly subscription:
              </p>
              <p className="text-2xl font-bold text-bauhaus-blue mt-1">
                {formatCurrency(14.99 * charityPercentage / 100)} / month to charity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charity Selection */}
      <Card hover={false}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Choose a Charity</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-bauhaus-gray" />
            <Input
              type="text"
              placeholder="Search charities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredCharities.map((charity) => (
              <motion.button
                key={charity.id}
                onClick={() => setSelectedCharity(charity.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`text-left p-4 border-2 transition-all ${
                  selectedCharity === charity.id
                    ? 'border-bauhaus-red bg-bauhaus-red/5'
                    : 'border-bauhaus-black/10 hover:border-bauhaus-black/30'
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-bauhaus-light-gray rounded-lg overflow-hidden flex-shrink-0">
                    {charity.image_url && (
                      <Image
                        src={charity.image_url}
                        alt={charity.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold truncate">{charity.name}</h3>
                      {selectedCharity === charity.id && (
                        <div className="w-6 h-6 bg-bauhaus-red rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-bauhaus-gray line-clamp-2 mt-1">
                      {charity.description}
                    </p>
                    {charity.is_featured && (
                      <Badge variant="warning" size="sm" className="mt-2">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {filteredCharities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-bauhaus-gray">No charities found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving} size="lg">
          <Heart className="w-5 h-5 mr-2" />
          Save Charity Preferences
        </Button>
      </div>
    </div>
  )
}
