import { createClient } from '@/lib/supabase/server'
import { VerificationClient } from './verification-client'

export default async function AdminVerificationPage() {
  const supabase = createClient()

  // Fetch winners with user and draw details
  const { data: winners } = await supabase
    .from('winners')
    .select('*, user:users(*), draw:draws(*)')
    .order('created_at', { ascending: false })

  // Get stats
  const pending = winners?.filter(w => w.verification_status === 'pending').length || 0
  const approved = winners?.filter(w => w.verification_status === 'approved').length || 0
  const rejected = winners?.filter(w => w.verification_status === 'rejected').length || 0
  const pendingPayout = winners?.filter(w => w.verification_status === 'approved' && w.payout_status === 'pending').length || 0

  const stats = {
    pending,
    approved,
    rejected,
    pendingPayout,
    totalPrizeAmount: winners?.filter(w => w.verification_status === 'approved').reduce((sum, w) => sum + w.prize_amount, 0) || 0,
    pendingPayoutAmount: winners?.filter(w => w.verification_status === 'approved' && w.payout_status === 'pending').reduce((sum, w) => sum + w.prize_amount, 0) || 0,
  }

  return (
    <VerificationClient 
      winners={winners || []} 
      stats={stats}
    />
  )
}
