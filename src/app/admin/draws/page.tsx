import { createClient, createAdminClient } from '@/lib/supabase/server'
import { DrawsClient } from './draws-client'
import { PRICING, SUBSCRIPTION_POOL_PERCENTAGE, PRIZE_DISTRIBUTION } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminDrawsPage() {
  const supabase = createClient()
  const adminSupabase = createAdminClient()

  // Fetch draws with winner counts
  const { data: draws } = await adminSupabase
    .from('draws')
    .select('*')
    .order('draw_date', { ascending: false })
    .limit(50)

  // Fetch current prize pool
  const { data: prizePool } = await adminSupabase
    .from('prize_pools')
    .select('*')
    .order('month', { ascending: false })
    .limit(1)
    .single()

  // Fetch active subscribers with plan details
  const { data: activeSubscriptions } = await adminSupabase
    .from('subscriptions')
    .select('plan_type')
    .eq('status', 'active')

  const activeSubscribers = activeSubscriptions?.length || 0

  // Calculate current month's prize pool based on active subscribers
  let calculatedPool = 0
  if (activeSubscriptions) {
    activeSubscriptions.forEach(sub => {
      const monthlyContribution = sub.plan_type === 'yearly' 
        ? (PRICING.yearly.amount / 12) * SUBSCRIPTION_POOL_PERCENTAGE
        : PRICING.monthly.amount * SUBSCRIPTION_POOL_PERCENTAGE
      calculatedPool += monthlyContribution
    })
  }

  // Get rollover from last completed draw (if no 5-match winner)
  const { data: lastDraw } = await adminSupabase
    .from('draws')
    .select('five_match_pool, rollover_amount')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(1)
    .single()

  // Check if last draw had a 5-match winner
  let rolloverAmount = 0
  if (lastDraw) {
    const { count: fiveMatchWinners } = await adminSupabase
      .from('winners')
      .select('*', { count: 'exact', head: true })
      .eq('draw_id', (await adminSupabase.from('draws').select('id').eq('status', 'published').order('draw_date', { ascending: false }).limit(1).single()).data?.id)
      .eq('match_type', 'five_match')
    
    if (!fiveMatchWinners || fiveMatchWinners === 0) {
      rolloverAmount = (lastDraw.five_match_pool || 0) + (lastDraw.rollover_amount || 0)
    }
  }

  // Build effective prize pool
  const effectivePrizePool = prizePool || {
    total_amount: calculatedPool,
    five_match_pool: calculatedPool * PRIZE_DISTRIBUTION.five_match,
    four_match_pool: calculatedPool * PRIZE_DISTRIBUTION.four_match,
    three_match_pool: calculatedPool * PRIZE_DISTRIBUTION.three_match,
    rollover_amount: rolloverAmount,
    subscriber_count: activeSubscribers,
  }

  // If no prize pool record but we have subscribers, use calculated values
  if (!prizePool && activeSubscribers > 0) {
    effectivePrizePool.total_amount = calculatedPool
    effectivePrizePool.five_match_pool = calculatedPool * PRIZE_DISTRIBUTION.five_match
    effectivePrizePool.four_match_pool = calculatedPool * PRIZE_DISTRIBUTION.four_match
    effectivePrizePool.three_match_pool = calculatedPool * PRIZE_DISTRIBUTION.three_match
    effectivePrizePool.rollover_amount = rolloverAmount
    effectivePrizePool.subscriber_count = activeSubscribers
  }

  // Get winner counts for each draw
  const drawsWithWinners = await Promise.all(
    (draws || []).map(async (draw) => {
      const { count: winnerCount } = await adminSupabase
        .from('winners')
        .select('*', { count: 'exact', head: true })
        .eq('draw_id', draw.id)
      
      return {
        ...draw,
        winner_count: winnerCount || 0,
      }
    })
  )

  return (
    <DrawsClient 
      draws={drawsWithWinners} 
      prizePool={effectivePrizePool}
      activeSubscribers={activeSubscribers}
    />
  )
}
