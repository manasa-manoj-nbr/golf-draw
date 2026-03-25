import { createClient, createAdminClient } from '@/lib/supabase/server'
import { DashboardOverview } from './dashboard-overview'

// Disable all caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Use admin client to bypass RLS
  const adminSupabase = createAdminClient()

  // Fetch user data
  const { data: profile } = await adminSupabase
    .from('users')
    .select('*, charity:charities(*)')
    .eq('id', user?.id)
    .single()

  // Fetch subscription
  const { data: subscription } = await adminSupabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  // Fetch scores
  const { data: scores } = await adminSupabase
    .from('scores')
    .select('*')
    .eq('user_id', user?.id)
    .order('played_date', { ascending: false })
    .limit(5)

  // Fetch winnings
  const { data: winnings } = await adminSupabase
    .from('winners')
    .select('*, draw:draws(*)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch latest draw (public, so RLS should work but use admin for consistency)
  const { data: latestDraw } = await adminSupabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(1)
    .single()

  // Calculate stats
  const totalWinnings = winnings?.reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0
  const pendingPayouts = winnings?.filter(w => w.payout_status === 'pending')
    .reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0

  return (
    <DashboardOverview
      profile={profile}
      subscription={subscription}
      scores={scores || []}
      winnings={winnings || []}
      latestDraw={latestDraw}
      totalWinnings={totalWinnings}
      pendingPayouts={pendingPayouts}
    />
  )
}
