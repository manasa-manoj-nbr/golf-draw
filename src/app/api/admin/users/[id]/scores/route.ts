import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/users/[id]/scores - Get user's scores
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    
    // Check if user is admin
    const { data: profile } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: scores, error } = await adminSupabase
      .from('scores')
      .select('*')
      .eq('user_id', params.id)
      .order('played_date', { ascending: false })

    if (error) {
      console.error('Error fetching scores:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ scores })
  } catch (error: any) {
    console.error('Admin get scores error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/admin/users/[id]/scores - Add score for user
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    
    // Check if user is admin
    const { data: profile } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { score, played_date } = body

    // Validate score
    if (!score || score < 1 || score > 45) {
      return NextResponse.json({ 
        error: 'Score must be between 1 and 45' 
      }, { status: 400 })
    }

    if (!played_date) {
      return NextResponse.json({ 
        error: 'Date is required' 
      }, { status: 400 })
    }

    // Check if user exists
    const { data: targetUser } = await adminSupabase
      .from('users')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Add score
    const { data: newScore, error } = await adminSupabase
      .from('scores')
      .insert({
        user_id: params.id,
        score,
        played_date,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding score:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get updated scores list
    const { data: scores } = await adminSupabase
      .from('scores')
      .select('*')
      .eq('user_id', params.id)
      .order('played_date', { ascending: false })
      .limit(5)

    return NextResponse.json({ score: newScore, scores })
  } catch (error: any) {
    console.error('Admin add score error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/users/[id]/scores - Update a score
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    
    // Check if user is admin
    const { data: profile } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { score_id, score, played_date } = body

    if (!score_id) {
      return NextResponse.json({ error: 'Score ID is required' }, { status: 400 })
    }

    // Validate score
    if (score !== undefined && (score < 1 || score > 45)) {
      return NextResponse.json({ 
        error: 'Score must be between 1 and 45' 
      }, { status: 400 })
    }

    // Build update object
    const updateData: Record<string, any> = {}
    if (score !== undefined) updateData.score = score
    if (played_date !== undefined) updateData.played_date = played_date

    const { data: updatedScore, error } = await adminSupabase
      .from('scores')
      .update(updateData)
      .eq('id', score_id)
      .eq('user_id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating score:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ score: updatedScore })
  } catch (error: any) {
    console.error('Admin update score error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id]/scores - Delete a score
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    
    // Check if user is admin
    const { data: profile } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const scoreId = searchParams.get('score_id')

    if (!scoreId) {
      return NextResponse.json({ error: 'Score ID is required' }, { status: 400 })
    }

    const { error } = await adminSupabase
      .from('scores')
      .delete()
      .eq('id', scoreId)
      .eq('user_id', params.id)

    if (error) {
      console.error('Error deleting score:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Admin delete score error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
