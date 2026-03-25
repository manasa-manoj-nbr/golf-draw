import { createClient } from '@/lib/supabase/server'
import { UsersClient } from './users-client'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const supabase = createClient()
  
  const filter = searchParams.filter || 'all'
  const search = searchParams.search || ''
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('users')
    .select('*, subscriptions(*), scores(*)', { count: 'exact' })

  // Apply search filter
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  // Apply subscription filter via join
  if (filter === 'active') {
    query = query.eq('subscriptions.status', 'active')
  } else if (filter === 'inactive') {
    query = query.or('subscriptions.status.is.null,subscriptions.status.neq.active')
  }

  const { data: users, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const totalPages = Math.ceil((count || 0) / limit)

  // Get subscription stats
  const { count: totalActive } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const stats = {
    totalUsers: count || 0,
    activeSubscribers: totalActive || 0,
    inactiveUsers: (count || 0) - (totalActive || 0),
  }

  return (
    <UsersClient 
      users={users || []} 
      stats={stats}
      currentPage={page}
      totalPages={totalPages}
      currentFilter={filter}
      currentSearch={search}
    />
  )
}
