import { createClient } from '@/lib/supabase/server'
import { WinningsClient } from './winnings-client'

export default async function WinningsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all winnings
  const { data: winnings } = await supabase
    .from('winners')
    .select('*, draw:draws(*)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  // Calculate totals
  const totalWon = winnings?.reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0
  const totalPaid = winnings?.filter(w => w.payout_status === 'paid')
    .reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0
  const pendingVerification = winnings?.filter(w => w.verification_status === 'pending')
    .reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0

  return (
    <WinningsClient 
      winnings={winnings || []}
      totalWon={totalWon}
      totalPaid={totalPaid}
      pendingVerification={pendingVerification}
    />
  )
}
