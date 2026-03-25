import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to verify admin
async function verifyAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin' ? user : null
}

// GET - List all winners for verification
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const admin = await verifyAdmin(supabase)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('winners')
      .select('*, user:users(*), draw:draws(*)')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('verification_status', status)
    }

    const { data: winners, error } = await query

    if (error) throw error

    return NextResponse.json({ data: winners })
  } catch (error) {
    console.error('Verification GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update verification or payout status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const admin = await verifyAdmin(supabase)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { winner_id, verification_status, payout_status, admin_notes } = body

    if (!winner_id) {
      return NextResponse.json({ error: 'Winner ID required' }, { status: 400 })
    }

    const updateData: any = {}

    if (verification_status) {
      updateData.verification_status = verification_status
      updateData.verified_at = verification_status === 'approved' || verification_status === 'rejected'
        ? new Date().toISOString()
        : null
    }

    if (payout_status) {
      updateData.payout_status = payout_status
      updateData.paid_at = payout_status === 'paid' ? new Date().toISOString() : null
    }

    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes
    }

    const { data: winner, error } = await supabase
      .from('winners')
      .update(updateData)
      .eq('id', winner_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: winner })
  } catch (error) {
    console.error('Verification PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
