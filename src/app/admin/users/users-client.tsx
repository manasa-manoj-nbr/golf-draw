'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, 
  Users, 
  CreditCard, 
  UserX,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Calendar,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { User, Subscription, Score } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface UserWithDetails extends User {
  subscriptions: Subscription[]
  scores: Score[]
}

interface UsersClientProps {
  users: UserWithDetails[]
  stats: {
    totalUsers: number
    activeSubscribers: number
    inactiveUsers: number
  }
  currentPage: number
  totalPages: number
  currentFilter: string
  currentSearch: string
}

export function UsersClient({ 
  users, 
  stats, 
  currentPage, 
  totalPages,
  currentFilter,
  currentSearch
}: UsersClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (currentFilter !== 'all') params.set('filter', currentFilter)
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filter !== 'all') params.set('filter', filter)
    router.push(`/admin/users?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (currentFilter !== 'all') params.set('filter', currentFilter)
    params.set('page', page.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  const getSubscriptionStatus = (user: UserWithDetails) => {
    const activeSub = user.subscriptions?.find(s => s.status === 'active')
    return activeSub ? 'active' : 'inactive'
  }

  const filters = [
    { key: 'all', label: 'All Users', count: stats.totalUsers },
    { key: 'active', label: 'Active', count: stats.activeSubscribers },
    { key: 'inactive', label: 'Inactive', count: stats.inactiveUsers },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-bauhaus-black">
          User Management
        </h1>
        <p className="mt-2 text-bauhaus-gray">
          View and manage all platform users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-blue flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-green flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Active Subscribers</p>
                <p className="text-2xl font-bold">{stats.activeSubscribers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-gray flex items-center justify-center">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Inactive Users</p>
                <p className="text-2xl font-bold">{stats.inactiveUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Filter Tabs */}
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleFilterChange(filter.key)}
                  className={cn(
                    'px-4 py-2 font-medium transition-colors border-2',
                    currentFilter === filter.key
                      ? 'bg-bauhaus-black text-white border-bauhaus-black'
                      : 'bg-white text-bauhaus-black border-bauhaus-black/20 hover:border-bauhaus-black'
                  )}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Button type="submit" variant="secondary">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bauhaus-black text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">User</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-left font-bold">Plan</th>
                  <th className="px-6 py-4 text-left font-bold">Scores</th>
                  <th className="px-6 py-4 text-left font-bold">Joined</th>
                  <th className="px-6 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-bauhaus-black/10">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-bauhaus-gray">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => {
                    const status = getSubscriptionStatus(user)
                    const activeSub = user.subscriptions?.find(s => s.status === 'active')
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-bauhaus-black/5"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-bauhaus-blue flex items-center justify-center text-white font-bold">
                              {user.full_name?.[0] || user.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-bauhaus-black">
                                {user.full_name || 'No name'}
                              </p>
                              <p className="text-sm text-bauhaus-gray">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'px-3 py-1 text-xs font-bold',
                            status === 'active' 
                              ? 'bg-bauhaus-green text-white' 
                              : 'bg-bauhaus-gray/20 text-bauhaus-gray'
                          )}>
                            {status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {activeSub ? (
                            <span className="font-medium capitalize">{activeSub.plan_type}</span>
                          ) : (
                            <span className="text-bauhaus-gray">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{user.scores?.length || 0}</span>
                          <span className="text-bauhaus-gray">/5</span>
                        </td>
                        <td className="px-6 py-4 text-bauhaus-gray">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t-2 border-bauhaus-black/10">
              <p className="text-sm text-bauhaus-gray">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-bauhaus-black/5">
              <div className="w-16 h-16 bg-bauhaus-blue flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.full_name?.[0] || selectedUser.email[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedUser.full_name || 'No name'}</h3>
                <p className="text-bauhaus-gray">{selectedUser.email}</p>
                <p className="text-sm text-bauhaus-gray mt-1">
                  Role: <span className="font-medium capitalize">{selectedUser.role}</span>
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border-2 border-bauhaus-black/10 text-center">
                <Mail className="w-5 h-5 mx-auto text-bauhaus-blue mb-2" />
                <p className="text-xs text-bauhaus-gray">Status</p>
                <p className="font-bold capitalize">{getSubscriptionStatus(selectedUser)}</p>
              </div>
              <div className="p-4 border-2 border-bauhaus-black/10 text-center">
                <Target className="w-5 h-5 mx-auto text-bauhaus-red mb-2" />
                <p className="text-xs text-bauhaus-gray">Scores</p>
                <p className="font-bold">{selectedUser.scores?.length || 0}/5</p>
              </div>
              <div className="p-4 border-2 border-bauhaus-black/10 text-center">
                <Calendar className="w-5 h-5 mx-auto text-bauhaus-green mb-2" />
                <p className="text-xs text-bauhaus-gray">Joined</p>
                <p className="font-bold">{formatDate(selectedUser.created_at)}</p>
              </div>
            </div>

            {/* Subscription Details */}
            {selectedUser.subscriptions?.length > 0 && (
              <div>
                <h4 className="font-bold mb-3">Subscription History</h4>
                <div className="space-y-2">
                  {selectedUser.subscriptions.map((sub) => (
                    <div key={sub.id} className="p-4 border-2 border-bauhaus-black/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium capitalize">{sub.plan_type} Plan</p>
                          <p className="text-sm text-bauhaus-gray">
                            {sub.current_period_end && `Renews: ${formatDate(sub.current_period_end)}`}
                          </p>
                        </div>
                        <span className={cn(
                          'px-2 py-1 text-xs font-bold',
                          sub.status === 'active' ? 'bg-bauhaus-green text-white' :
                          sub.status === 'canceled' ? 'bg-bauhaus-red text-white' :
                          'bg-bauhaus-gray/20 text-bauhaus-gray'
                        )}>
                          {sub.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scores */}
            {selectedUser.scores?.length > 0 && (
              <div>
                <h4 className="font-bold mb-3">Current Scores</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedUser.scores
                    .sort((a, b) => new Date(b.played_date).getTime() - new Date(a.played_date).getTime())
                    .slice(0, 5)
                    .map((score) => (
                      <div key={score.id} className="w-16 h-16 bg-bauhaus-yellow flex flex-col items-center justify-center">
                        <span className="text-xl font-bold">{score.score}</span>
                        <span className="text-xs">{new Date(score.played_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t-2 border-bauhaus-black/10">
              <Button variant="outline" className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="secondary" className="flex-1">
                View Full History
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
