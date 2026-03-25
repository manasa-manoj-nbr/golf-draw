import { createClient, createAdminClient } from '@/lib/supabase/server'
import { AdminDashboardClient } from './admin-dashboard'
import { PRICING, SUBSCRIPTION_POOL_PERCENTAGE, PRIZE_DISTRIBUTION } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const adminSupabase = createAdminClient()

  // Fetch dashboard stats using admin client
  const [
    { count: totalUsers },
    { data: activeSubscriptions },
    { data: prizePool },
    { count: pendingVerifications },
    { data: recentDraws },
    { data: totalDonations },
    { data: recentWinners },
  ] = await Promise.all([
    // Total users
    adminSupabase.from('users').select('*', { count: 'exact', head: true }),
    // Active subscribers with plan type
    adminSupabase.from('subscriptions').select('plan_type').eq('status', 'active'),
    // Current prize pool
    adminSupabase
      .from('prize_pools')
      .select('*')
      .order('month', { ascending: false })
      .limit(1)
      .single(),
    // Pending verifications
    adminSupabase.from('winners').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    // Recent draws
    adminSupabase
      .from('draws')
      .select('*')
      .order('draw_date', { ascending: false })
      .limit(5),
    // Total donations
    adminSupabase.from('donations').select('amount'),
    // Recent winners
    adminSupabase
      .from('winners')
      .select('*, user:users(*), draw:draws(*)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const activeSubscribers = activeSubscriptions?.length || 0
  const totalDonationAmount = totalDonations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0

  // Calculate prize pool from active subscribers if no prize pool record exists
  let calculatedPool = 0
  if (activeSubscriptions) {
    activeSubscriptions.forEach(sub => {
      const monthlyContribution = sub.plan_type === 'yearly' 
        ? (PRICING.yearly.amount / 12) * SUBSCRIPTION_POOL_PERCENTAGE
        : PRICING.monthly.amount * SUBSCRIPTION_POOL_PERCENTAGE
      calculatedPool += monthlyContribution
    })
  }

  // Get rollover amount from last draw if no 5-match winner
  let rolloverAmount = prizePool?.rollover_amount || 0
  if (!prizePool && recentDraws && recentDraws.length > 0) {
    const lastPublishedDraw = recentDraws.find(d => d.status === 'published')
    if (lastPublishedDraw) {
      const { count: fiveMatchWinners } = await adminSupabase
        .from('winners')
        .select('*', { count: 'exact', head: true })
        .eq('draw_id', lastPublishedDraw.id)
        .eq('match_type', 'five_match')
      
      if (!fiveMatchWinners || fiveMatchWinners === 0) {
        rolloverAmount = (lastPublishedDraw.five_match_pool || 0) + (lastPublishedDraw.rollover_amount || 0)
      }
    }
  }

  const effectivePoolAmount = prizePool?.total_amount || calculatedPool
  const effectiveFiveMatchPool = prizePool?.five_match_pool || (calculatedPool * PRIZE_DISTRIBUTION.five_match)

  const stats = {
    totalUsers: totalUsers || 0,
    activeSubscribers: activeSubscribers,
    totalPrizePool: effectivePoolAmount,
    currentJackpot: effectiveFiveMatchPool + rolloverAmount,
    totalCharityDonations: totalDonationAmount,
    pendingVerifications: pendingVerifications || 0,
    rolloverAmount: rolloverAmount,
  }

  return (
    <AdminDashboardClient 
      stats={stats} 
      recentDraws={recentDraws || []} 
      recentWinners={recentWinners || []}
    />
  )
}
