import { createClient } from '@/lib/supabase/server'
import { ReportsClient } from './reports-client'

export default async function AdminReportsPage() {
  const supabase = createClient()

  // Get date ranges
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Fetch various analytics data
  const [
    { count: totalUsers },
    { count: newUsersThisMonth },
    { count: newUsersLastMonth },
    { count: activeSubscriptions },
    { data: subscriptionsByPlan },
    { data: allDonations },
    { data: donationsThisMonth },
    { data: allDraws },
    { data: allWinners },
    { data: monthlySubscriptions },
  ] = await Promise.all([
    // Total users
    supabase.from('users').select('*', { count: 'exact', head: true }),
    // New users this month
    supabase.from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString()),
    // New users last month
    supabase.from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString()),
    // Active subscriptions
    supabase.from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    // Subscriptions by plan
    supabase.from('subscriptions')
      .select('plan_type, status')
      .eq('status', 'active'),
    // All donations
    supabase.from('donations').select('amount, created_at'),
    // Donations this month
    supabase.from('donations')
      .select('amount')
      .gte('created_at', startOfMonth.toISOString()),
    // All draws
    supabase.from('draws').select('*').order('draw_date', { ascending: false }),
    // All winners
    supabase.from('winners').select('*, draw:draws(draw_date)'),
    // Monthly subscriptions (last 6 months)
    supabase.from('subscriptions')
      .select('created_at, plan_type')
      .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()),
  ])

  // Calculate statistics
  const monthlyCount = subscriptionsByPlan?.filter(s => s.plan_type === 'monthly').length || 0
  const yearlyCount = subscriptionsByPlan?.filter(s => s.plan_type === 'yearly').length || 0

  const totalDonationAmount = allDonations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
  const donationsThisMonthAmount = donationsThisMonth?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

  const totalPrizesPaid = allWinners
    ?.filter(w => w.payout_status === 'paid')
    .reduce((sum, w) => sum + (w.prize_amount || 0), 0) || 0

  // Calculate monthly revenue (simplified)
  const monthlyRevenue = (monthlyCount * 14.99) + (yearlyCount * 129 / 12)

  // User growth calculation
  const userGrowthRate = newUsersLastMonth && newUsersLastMonth > 0
    ? (((newUsersThisMonth || 0) - newUsersLastMonth) / newUsersLastMonth) * 100
    : 0

  // Process monthly subscription data for chart
  const monthlyData: { month: string; subscriptions: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short' })
    
    const count = monthlySubscriptions?.filter(s => {
      const date = new Date(s.created_at)
      return date >= monthDate && date <= monthEnd
    }).length || 0
    
    monthlyData.push({ month: monthLabel, subscriptions: count })
  }

  const stats = {
    totalUsers: totalUsers || 0,
    newUsersThisMonth: newUsersThisMonth || 0,
    userGrowthRate: Math.round(userGrowthRate),
    activeSubscriptions: activeSubscriptions || 0,
    monthlySubscribers: monthlyCount,
    yearlySubscribers: yearlyCount,
    monthlyRevenue,
    totalDonations: totalDonationAmount,
    donationsThisMonth: donationsThisMonthAmount,
    totalDraws: allDraws?.length || 0,
    totalWinners: allWinners?.length || 0,
    totalPrizesPaid,
    monthlyData,
  }

  return <ReportsClient stats={stats} />
}
