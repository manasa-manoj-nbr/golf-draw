import { createClient } from '@/lib/supabase/server'
import { CharitiesClient } from './charities-client'

export default async function AdminCharitiesPage() {
  const supabase = createClient()

  // Fetch charities with donation totals
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .order('created_at', { ascending: false })

  // Get donation totals per charity
  const charitiesWithDonations = await Promise.all(
    (charities || []).map(async (charity) => {
      const { data: donations } = await supabase
        .from('donations')
        .select('amount')
        .eq('charity_id', charity.id)
      
      const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('charity_id', charity.id)
      
      return {
        ...charity,
        total_donations: totalDonations,
        user_count: userCount || 0,
      }
    })
  )

  // Get overall stats
  const { data: allDonations } = await supabase
    .from('donations')
    .select('amount')
  
  const totalAllDonations = allDonations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

  const stats = {
    totalCharities: charities?.length || 0,
    activeCharities: charities?.filter(c => c.is_active).length || 0,
    featuredCharities: charities?.filter(c => c.is_featured).length || 0,
    totalDonations: totalAllDonations,
  }

  return (
    <CharitiesClient 
      charities={charitiesWithDonations} 
      stats={stats}
    />
  )
}
