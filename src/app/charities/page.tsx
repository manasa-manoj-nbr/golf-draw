'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Heart, Calendar, MapPin, ExternalLink, Star } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button, Card, CardContent, Input, Badge } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Charity, CharityEvent } from '@/types'

// Mock data for charities (in production, this would come from Supabase)
const mockCharities: Charity[] = [
  {
    id: '1',
    name: 'Golf for Good Foundation',
    description: 'Dedicated to using the power of golf to transform lives. We provide golf scholarships, adaptive golf programs, and community development initiatives across the country.',
    image_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
    website: 'https://example.com',
    is_featured: true,
    is_active: true,
    events: [
      {
        title: 'Annual Charity Golf Day',
        description: 'Join us for our flagship fundraising event',
        date: '2024-06-15',
        location: 'Royal Golf Club',
      },
    ],
    total_donations: 45000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Youth First Initiative',
    description: 'Empowering underprivileged youth through sports, education, and mentorship programs. Every child deserves a chance to succeed.',
    image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    website: 'https://example.com',
    is_featured: true,
    is_active: true,
    events: [
      {
        title: 'Youth Golf Camp',
        description: 'Free golf instruction for kids aged 8-16',
        date: '2024-07-20',
        location: 'Community Golf Center',
      },
    ],
    total_donations: 32000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Green Fairways Environmental Trust',
    description: 'Protecting and preserving natural landscapes while promoting sustainable golf course management practices worldwide.',
    image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    website: 'https://example.com',
    is_featured: false,
    is_active: true,
    events: [],
    total_donations: 18500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Veterans on the Green',
    description: 'Supporting military veterans through therapeutic golf programs, community building, and career transition assistance.',
    image_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    website: 'https://example.com',
    is_featured: true,
    is_active: true,
    events: [
      {
        title: 'Veterans Golf Tournament',
        description: 'Annual tournament honoring our heroes',
        date: '2024-11-11',
        location: 'Freedom Golf Course',
      },
    ],
    total_donations: 28000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Swing for Hope Cancer Foundation',
    description: 'Funding cancer research and supporting families affected by cancer through the golf community.',
    image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800',
    website: 'https://example.com',
    is_featured: false,
    is_active: true,
    events: [],
    total_donations: 52000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function CharitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [charities, setCharities] = useState<Charity[]>(mockCharities)
  const [filteredCharities, setFilteredCharities] = useState<Charity[]>(mockCharities)
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  useEffect(() => {
    let filtered = charities
    
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (showFeaturedOnly) {
      filtered = filtered.filter((c) => c.is_featured)
    }
    
    setFilteredCharities(filtered)
  }, [searchQuery, showFeaturedOnly, charities])

  const featuredCharities = charities.filter((c) => c.is_featured)
  const totalDonations = charities.reduce((sum, c) => sum + c.total_donations, 0)

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero */}
        <section className="py-20 bg-bauhaus-blue text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-bauhaus-yellow transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Heart className="w-16 h-16 mx-auto mb-6 text-bauhaus-yellow" />
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
                Charities We Support
              </h1>
              <p className="text-xl text-white/80 mb-8">
                At least 10% of every subscription goes directly to these amazing organizations. Choose the cause that matters most to you.
              </p>
              <div className="flex flex-wrap justify-center gap-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-bauhaus-yellow">{formatCurrency(totalDonations)}</p>
                  <p className="text-white/60">Total Donated</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-bauhaus-yellow">{charities.length}</p>
                  <p className="text-white/60">Charities</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-bauhaus-yellow">2,500+</p>
                  <p className="text-white/60">Donors</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Spotlight */}
        {featuredCharities.length > 0 && (
          <section className="py-16 bg-bauhaus-yellow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-8">
                <Star className="w-6 h-6 text-bauhaus-black fill-bauhaus-black" />
                <h2 className="font-display text-2xl font-bold">Featured Charities</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {featuredCharities.slice(0, 3).map((charity, index) => (
                  <motion.div
                    key={charity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-white">
                      <div className="h-40 relative overflow-hidden">
                        <Image
                          src={charity.image_url || '/placeholder.jpg'}
                          alt={charity.name}
                          fill
                          className="object-cover"
                        />
                        <Badge className="absolute top-3 right-3" variant="warning">
                          Featured
                        </Badge>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-bold text-lg mb-2">{charity.name}</h3>
                        <p className="text-bauhaus-gray text-sm line-clamp-2 mb-4">
                          {charity.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-bauhaus-gray">
                            {formatCurrency(charity.total_donations)} raised
                          </span>
                          <Heart className="w-5 h-5 text-bauhaus-red" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Search & Filter */}
        <section className="py-8 bg-bauhaus-white border-b-2 border-bauhaus-black/10 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bauhaus-gray" />
                <Input
                  type="text"
                  placeholder="Search charities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>
              <Button
                variant={showFeaturedOnly ? 'primary' : 'outline'}
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              >
                <Star className="w-4 h-4 mr-2" />
                Featured Only
              </Button>
            </div>
          </div>
        </section>

        {/* Charity Grid */}
        <section className="py-16 bg-bauhaus-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-2xl font-bold">
                All Charities ({filteredCharities.length})
              </h2>
            </div>

            {filteredCharities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-bauhaus-gray text-lg">No charities found matching your search.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCharities.map((charity, index) => (
                  <motion.div
                    key={charity.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full flex flex-col">
                      <div className="h-48 relative overflow-hidden">
                        <Image
                          src={charity.image_url || '/placeholder.jpg'}
                          alt={charity.name}
                          fill
                          className="object-cover"
                        />
                        {charity.is_featured && (
                          <Badge className="absolute top-3 right-3" variant="warning">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardContent className="flex-1 flex flex-col pt-4">
                        <h3 className="font-bold text-xl mb-2">{charity.name}</h3>
                        <p className="text-bauhaus-gray text-sm flex-1 mb-4">
                          {charity.description}
                        </p>
                        
                        {/* Events */}
                        {charity.events && charity.events.length > 0 && (
                          <div className="mb-4 p-3 bg-bauhaus-blue/5 border border-bauhaus-blue/20">
                            <p className="text-xs font-bold text-bauhaus-blue mb-2">UPCOMING EVENT</p>
                            <p className="font-medium text-sm">{charity.events[0].title}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-bauhaus-gray">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(charity.events[0].date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {charity.events[0].location}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-4 border-t border-bauhaus-black/10">
                          <div>
                            <p className="text-sm text-bauhaus-gray">Total Raised</p>
                            <p className="font-bold text-lg">{formatCurrency(charity.total_donations)}</p>
                          </div>
                          {charity.website && (
                            <a
                              href={charity.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-bauhaus-blue hover:underline"
                            >
                              Visit Site
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-bauhaus-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Make Your Golf Game <span className="text-bauhaus-yellow">Count</span>
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Subscribe today and start supporting the causes you care about while playing the game you love.
              </p>
              <Link href="/signup">
                <Button variant="accent" size="lg">
                  Subscribe Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
