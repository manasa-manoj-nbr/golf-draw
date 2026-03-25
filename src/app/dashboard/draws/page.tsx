import { createClient } from '@/lib/supabase/server'
import { DrawsClient } from './draws-client'

export default async function DrawsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch published draws
  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(12)

  // Fetch user's scores
  const { data: scores } = await supabase
    .from('scores')
    .select('score')
    .eq('user_id', user?.id)
    .order('played_date', { ascending: false })
    .limit(5)

  // Fetch user's winnings for these draws
  const { data: winnings } = await supabase
    .from('winners')
    .select('draw_id, match_type, prize_amount')
    .eq('user_id', user?.id)

  return (
    <DrawsClient 
      draws={draws || []} 
      userScores={scores?.map(s => s.score) || []}
      userWinnings={winnings || []}
    />
  )
}
