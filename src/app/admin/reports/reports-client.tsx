'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  DollarSign,
  Heart,
  Trophy,
  Award,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ReportsClientProps {
  stats: {
    totalUsers: number
    newUsersThisMonth: number
    userGrowthRate: number
    activeSubscriptions: number
    monthlySubscribers: number
    yearlySubscribers: number
    monthlyRevenue: number
    totalDonations: number
    donationsThisMonth: number
    totalDraws: number
    totalWinners: number
    totalPrizesPaid: number
    monthlyData: { month: string; subscriptions: number }[]
  }
}

export function ReportsClient({ stats }: ReportsClientProps) {
  const maxSubscriptions = Math.max(...stats.monthlyData.map(d => d.subscriptions), 1)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-bauhaus-black">
          Reports & Analytics
        </h1>
        <p className="mt-2 text-bauhaus-gray">
          Platform performance metrics and insights
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-bauhaus-gray">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="w-14 h-14 bg-bauhaus-blue flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-bauhaus-gray">New This Month</p>
                  <p className="text-3xl font-bold mt-1">{stats.newUsersThisMonth.toLocaleString()}</p>
                </div>
                <div className="w-14 h-14 bg-bauhaus-green flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-bauhaus-gray">Growth Rate</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold">{Math.abs(stats.userGrowthRate)}%</p>
                    {stats.userGrowthRate >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-bauhaus-green" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-bauhaus-red" />
                    )}
                  </div>
                </div>
                <div className={cn(
                  'w-14 h-14 flex items-center justify-center',
                  stats.userGrowthRate >= 0 ? 'bg-bauhaus-green' : 'bg-bauhaus-red'
                )}>
                  {stats.userGrowthRate >= 0 ? (
                    <TrendingUp className="w-7 h-7 text-white" />
                  ) : (
                    <TrendingDown className="w-7 h-7 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscription & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-bauhaus-blue/10 border-2 border-bauhaus-blue">
                <p className="text-sm text-bauhaus-gray">Active Subscribers</p>
                <p className="text-2xl font-bold mt-1">{stats.activeSubscriptions.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-bauhaus-yellow/10 border-2 border-bauhaus-yellow">
                <p className="text-sm text-bauhaus-gray">Est. Monthly Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Monthly Plans</span>
                  <span className="text-bauhaus-gray">{stats.monthlySubscribers}</span>
                </div>
                <div className="h-4 bg-bauhaus-black/10">
                  <div 
                    className="h-full bg-bauhaus-blue transition-all"
                    style={{ 
                      width: stats.activeSubscriptions > 0 
                        ? `${(stats.monthlySubscribers / stats.activeSubscriptions) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Yearly Plans</span>
                  <span className="text-bauhaus-gray">{stats.yearlySubscribers}</span>
                </div>
                <div className="h-4 bg-bauhaus-black/10">
                  <div 
                    className="h-full bg-bauhaus-yellow transition-all"
                    style={{ 
                      width: stats.activeSubscriptions > 0 
                        ? `${(stats.yearlySubscribers / stats.activeSubscriptions) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Charitable Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-bauhaus-red/10 border-2 border-bauhaus-red">
                <p className="text-sm text-bauhaus-gray">Total Donated</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalDonations)}</p>
              </div>
              <div className="p-4 bg-bauhaus-green/10 border-2 border-bauhaus-green">
                <p className="text-sm text-bauhaus-gray">This Month</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.donationsThisMonth)}</p>
              </div>
            </div>

            <div className="p-6 bg-bauhaus-black/5 text-center">
              <Heart className="w-12 h-12 mx-auto text-bauhaus-red mb-2" />
              <p className="text-sm text-bauhaus-gray">
                Your platform has helped raise
              </p>
              <p className="text-3xl font-bold text-bauhaus-red mt-1">
                {formatCurrency(stats.totalDonations)}
              </p>
              <p className="text-sm text-bauhaus-gray mt-1">
                for charitable causes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-4">
            {stats.monthlyData.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ height: 0 }}
                animate={{ height: `${(data.subscriptions / maxSubscriptions) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-1 min-h-[20px] relative"
              >
                <div 
                  className={cn(
                    'w-full h-full',
                    index === stats.monthlyData.length - 1 
                      ? 'bg-bauhaus-blue' 
                      : 'bg-bauhaus-blue/40'
                  )}
                />
                <div className="absolute -bottom-8 left-0 right-0 text-center">
                  <span className="text-xs font-medium text-bauhaus-gray">{data.month}</span>
                </div>
                <div className="absolute -top-6 left-0 right-0 text-center">
                  <span className="text-sm font-bold">{data.subscriptions}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 pt-4 border-t-2 border-bauhaus-black/10 text-center text-sm text-bauhaus-gray">
            New subscriptions per month
          </div>
        </CardContent>
      </Card>

      {/* Prize & Draw Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-bauhaus-gray">Total Draws</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalDraws}</p>
                </div>
                <div className="w-14 h-14 bg-bauhaus-yellow flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-bauhaus-black" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-bauhaus-gray">Total Winners</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalWinners}</p>
                </div>
                <div className="w-14 h-14 bg-bauhaus-red flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-bauhaus-gray">Prizes Paid Out</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalPrizesPaid)}</p>
                </div>
                <div className="w-14 h-14 bg-bauhaus-green flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Card */}
      <Card className="bg-bauhaus-black text-white">
        <CardContent className="p-8">
          <h3 className="text-2xl font-display font-bold mb-6">Platform Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-bauhaus-yellow text-sm mb-1">Active Users</p>
              <p className="text-3xl font-bold">{stats.activeSubscriptions}</p>
            </div>
            <div>
              <p className="text-bauhaus-yellow text-sm mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div>
              <p className="text-bauhaus-yellow text-sm mb-1">Charitable Impact</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalDonations)}</p>
            </div>
            <div>
              <p className="text-bauhaus-yellow text-sm mb-1">Prizes Awarded</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalPrizesPaid)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
