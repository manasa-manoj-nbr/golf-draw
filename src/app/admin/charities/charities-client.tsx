'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Plus, 
  Star,
  DollarSign,
  Users,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Charity, CharityFormData, CharityEvent } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CharityWithStats extends Charity {
  user_count: number
}

interface CharitiesClientProps {
  charities: CharityWithStats[]
  stats: {
    totalCharities: number
    activeCharities: number
    featuredCharities: number
    totalDonations: number
  }
}

const emptyCharity: CharityFormData = {
  name: '',
  description: '',
  image_url: '',
  website: '',
  is_featured: false,
  is_active: true,
  events: [],
}

export function CharitiesClient({ charities, stats }: CharitiesClientProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editingCharity, setEditingCharity] = useState<CharityWithStats | null>(null)
  const [formData, setFormData] = useState<CharityFormData>(emptyCharity)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const handleOpenModal = (charity?: CharityWithStats) => {
    if (charity) {
      setEditingCharity(charity)
      setFormData({
        name: charity.name,
        description: charity.description,
        image_url: charity.image_url || '',
        website: charity.website || '',
        is_featured: charity.is_featured,
        is_active: charity.is_active,
        events: charity.events || [],
      })
    } else {
      setEditingCharity(null)
      setFormData(emptyCharity)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingCharity 
        ? `/api/admin/charities/${editingCharity.id}`
        : '/api/admin/charities'
      
      const response = await fetch(url, {
        method: editingCharity ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save charity')
      }

      setShowModal(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving charity:', error)
      alert('Failed to save charity. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (charityId: string, field: 'is_active' | 'is_featured', value: boolean) => {
    try {
      const response = await fetch(`/api/admin/charities/${charityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })

      if (!response.ok) {
        throw new Error('Failed to update charity')
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating charity:', error)
    }
  }

  const handleDelete = async (charityId: string) => {
    try {
      const response = await fetch(`/api/admin/charities/${charityId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete charity')
      }

      setShowDeleteConfirm(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting charity:', error)
      alert('Failed to delete charity. Please try again.')
    }
  }

  const handleAddEvent = () => {
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, { title: '', description: '', date: '', location: '' }],
    }))
  }

  const handleRemoveEvent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index),
    }))
  }

  const handleEventChange = (index: number, field: keyof CharityEvent, value: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.map((event, i) => 
        i === index ? { ...event, [field]: value } : event
      ),
    }))
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-bauhaus-black">
            Charity Management
          </h1>
          <p className="mt-2 text-bauhaus-gray">
            Manage charitable organizations and track donations
          </p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Charity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-red flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Total Charities</p>
                <p className="text-2xl font-bold">{stats.totalCharities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-green flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Active</p>
                <p className="text-2xl font-bold">{stats.activeCharities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-yellow flex items-center justify-center">
                <Star className="w-6 h-6 text-bauhaus-black" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Featured</p>
                <p className="text-2xl font-bold">{stats.featuredCharities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-blue flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Total Donations</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalDonations)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Heart className="w-12 h-12 mx-auto text-bauhaus-gray/50 mb-4" />
              <p className="text-bauhaus-gray">No charities yet. Add your first charity to get started.</p>
              <Button variant="primary" className="mt-4" onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Charity
              </Button>
            </CardContent>
          </Card>
        ) : (
          charities.map((charity, index) => (
            <motion.div
              key={charity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                'h-full',
                !charity.is_active && 'opacity-60'
              )}>
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="h-40 bg-bauhaus-gray/20 relative">
                    {charity.image_url ? (
                      <img 
                        src={charity.image_url} 
                        alt={charity.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-12 h-12 text-bauhaus-gray/50" />
                      </div>
                    )}
                    {charity.is_featured && (
                      <div className="absolute top-2 left-2 bg-bauhaus-yellow px-2 py-1 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span className="text-xs font-bold">Featured</span>
                      </div>
                    )}
                    {!charity.is_active && (
                      <div className="absolute top-2 right-2 bg-bauhaus-black text-white px-2 py-1 text-xs font-bold">
                        Inactive
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{charity.name}</h3>
                    <p className="text-sm text-bauhaus-gray line-clamp-2 mb-4">
                      {charity.description}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-bauhaus-blue" />
                        <span>{charity.user_count} supporters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-bauhaus-green" />
                        <span>{formatCurrency(charity.total_donations)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenModal(charity)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(charity.id, 'is_featured', !charity.is_featured)}
                      >
                        <Star className={cn(
                          'w-4 h-4',
                          charity.is_featured && 'fill-bauhaus-yellow text-bauhaus-yellow'
                        )} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(charity.id, 'is_active', !charity.is_active)}
                      >
                        {charity.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      {charity.website && (
                        <a
                          href={charity.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 border-2 border-bauhaus-black/20 hover:border-bauhaus-black"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto text-bauhaus-red hover:bg-bauhaus-red hover:text-white"
                        onClick={() => setShowDeleteConfirm(charity.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Charity Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCharity ? 'Edit Charity' : 'Add New Charity'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-bold mb-2">Charity Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter charity name"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the charity's mission..."
              rows={4}
              required
              className="w-full px-4 py-3 border-2 border-bauhaus-black/20 focus:border-bauhaus-black focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">Image URL</label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="w-5 h-5 accent-bauhaus-yellow"
              />
              <span className="font-medium">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-5 h-5 accent-bauhaus-green"
              />
              <span className="font-medium">Active</span>
            </label>
          </div>

          {/* Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="font-bold">Events</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddEvent}>
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
            </div>
            {formData.events.map((event, index) => (
              <div key={index} className="p-4 border-2 border-bauhaus-black/10 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Event {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvent(index)}
                    className="text-bauhaus-red hover:underline text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Event title"
                    value={event.title}
                    onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                  />
                  <Input
                    placeholder="Location"
                    value={event.location}
                    onChange={(e) => handleEventChange(index, 'location', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={event.date}
                    onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={event.description}
                    onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-bauhaus-black/10">
            <Button 
              type="button"
              variant="outline" 
              className="flex-1"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="primary" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingCharity ? 'Update Charity' : 'Add Charity'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Charity"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-bauhaus-gray">
            Are you sure you want to delete this charity? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 bg-bauhaus-red hover:bg-bauhaus-red/90"
              onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
