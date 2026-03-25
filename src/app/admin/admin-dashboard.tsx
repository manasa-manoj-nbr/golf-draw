'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  CreditCard, 
  Trophy, 
  Heart, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Draw, Winner } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number
    activeSubscribers: number
    totalPrizePool: number
    currentJackpot: number
    totalCharityDonations: number
    pendingVerifications: number
    rolloverAmount: number
  }
  recentDraws: Draw[]
  recentWinners: Winner[]
}

export function AdminDashboardClient({ stats, recentDraws, recentWinners }: AdminDashboardClientProps) {
  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-bauhaus-blue',
      href: '/admin/users',
    },
    {
      label: 'Active Subscribers',
      value: stats.activeSubscribers.toLocaleString(),
      icon: CreditCard,
      color: 'bg-bauhaus-green',
      href: '/admin/users?filter=active',
    },
    {
      label: 'Prize Pool',
      value: formatCurrency(stats.totalPrizePool),
      icon: Trophy,
      color: 'bg-bauhaus-yellow',
      href: '/admin/draws',
    },
    {
      label: 'Current Jackpot',
      value: formatCurrency(stats.currentJackpot),
      icon: DollarSign,
      color: 'bg-bauhaus-red',
      subtext: stats.rolloverAmount > 0 ? `+${formatCurrency(stats.rolloverAmount)} rollover` : undefined,
    },
    {
      label: 'Charity Donations',
      value: formatCurrency(stats.totalCharityDonations),
      icon: Heart,
      color: 'bg-bauhaus-red',
      href: '/admin/charities',
    },
    {
      label: 'Pending Verifications',
      value: stats.pendingVerifications.toString(),
      icon: AlertCircle,
      color: stats.pendingVerifications > 0 ? 'bg-bauhaus-red' : 'bg-bauhaus-gray',
      href: '/admin/verification',
      urgent: stats.pendingVerifications > 0,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-bauhaus-black">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-bauhaus-gray">
          Overview of platform metrics and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={stat.href || '#'}>
              <Card className={`hover:shadow-bauhaus-md transition-shadow ${stat.urgent ? 'ring-2 ring-bauhaus-red' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-bauhaus-gray">{stat.label}</p>
                      <p className="mt-2 text-3xl font-display font-bold text-bauhaus-black">
                        {stat.value}
                      </p>
                      {stat.subtext && (
                        <p className="mt-1 text-sm text-bauhaus-green font-medium">
                          {stat.subtext}
                        </p>
                      )}
                    </div>
                    <div className={`w-12 h-12 ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Draws */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Draws</CardTitle>
            <Link 
              href="/admin/draws" 
              className="text-sm text-bauhaus-blue hover:underline"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {recentDraws.length === 0 ? (
              <p className="text-bauhaus-gray text-center py-8">No draws yet</p>
            ) : (
              <div className="space-y-4">
                {recentDraws.map((draw) => (
                  <div
                    key={draw.id}
                    className="flex items-center justify-between p-4 border-2 border-bauhaus-black/10 hover:border-bauhaus-black/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-bauhaus-blue flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-bauhaus-black">
                          {formatDate(draw.draw_date)}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {draw.winning_numbers?.map((num, i) => (
                            <span
                              key={i}
                              className="w-6 h-6 bg-bauhaus-yellow text-bauhaus-black text-xs font-bold flex items-center justify-center"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs font-bold ${
                        draw.status === 'published' ? 'bg-bauhaus-green text-white' :
                        draw.status === 'completed' ? 'bg-bauhaus-blue text-white' :
                        'bg-bauhaus-gray/20 text-bauhaus-gray'
                      }`}>
                        {draw.status.toUpperCase()}
                      </span>
                      <p className="mt-1 text-sm text-bauhaus-gray">
                        Pool: {formatCurrency(draw.total_pool_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Winners */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Winners</CardTitle>
            <Link 
              href="/admin/verification" 
              className="text-sm text-bauhaus-blue hover:underline"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {recentWinners.length === 0 ? (
              <p className="text-bauhaus-gray text-center py-8">No winners yet</p>
            ) : (
              <div className="space-y-4">
                {recentWinners.slice(0, 5).map((winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center justify-between p-4 border-2 border-bauhaus-black/10 hover:border-bauhaus-black/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center ${
                        winner.match_type === 'five_match' ? 'bg-bauhaus-yellow' :
                        winner.match_type === 'four_match' ? 'bg-bauhaus-blue' :
                        'bg-bauhaus-red'
                      }`}>
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-bauhaus-black">
                          {winner.user?.full_name || winner.user?.email || 'Unknown User'}
                        </p>
                        <p className="text-sm text-bauhaus-gray">
                          {winner.match_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-bauhaus-black">
                        {formatCurrency(winner.prize_amount)}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs font-bold mt-1 ${
                        winner.verification_status === 'approved' ? 'bg-bauhaus-green text-white' :
                        winner.verification_status === 'rejected' ? 'bg-bauhaus-red text-white' :
                        'bg-bauhaus-yellow text-bauhaus-black'
                      }`}>
                        {winner.verification_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/draws"
              className="flex items-center gap-3 p-4 border-2 border-bauhaus-black bg-bauhaus-yellow hover:bg-bauhaus-yellow/80 transition-colors"
            >
              <Trophy className="w-5 h-5" />
              <span className="font-bold">Run New Draw</span>
            </Link>
            <Link
              href="/admin/charities"
              className="flex items-center gap-3 p-4 border-2 border-bauhaus-black bg-bauhaus-red text-white hover:bg-bauhaus-red/80 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="font-bold">Add Charity</span>
            </Link>
            <Link
              href="/admin/verification"
              className="flex items-center gap-3 p-4 border-2 border-bauhaus-black bg-bauhaus-blue text-white hover:bg-bauhaus-blue/80 transition-colors"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold">Review Winners</span>
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center gap-3 p-4 border-2 border-bauhaus-black bg-white hover:bg-bauhaus-black/5 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-bold">View Reports</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
