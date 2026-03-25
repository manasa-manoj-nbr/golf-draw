import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/users/[id] - Get single user details
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

    // Fetch user with all related data
    const { data: targetUser, error } = await adminSupabase
      .from('users')
      .select(`
        *,
        charity:charities(*),
        subscriptions(*),
        scores(*),
        winners(*, draw:draws(*)),
        donations(*, charity:charities(*))
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: targetUser })
  } catch (error: any) {
    console.error('Admin get user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - Update user profile
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
    const { full_name, email, role, charity_id, charity_percentage } = body

    // Validate charity_percentage
    if (charity_percentage !== undefined && (charity_percentage < 10 || charity_percentage > 100)) {
      return NextResponse.json({ 
        error: 'Charity percentage must be between 10 and 100' 
      }, { status: 400 })
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (charity_id !== undefined) updateData.charity_id = charity_id
    if (charity_percentage !== undefined) updateData.charity_percentage = charity_percentage

    const { data: updatedUser, error } = await adminSupabase
      .from('users')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Admin update user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user (soft delete via status or hard delete)
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

    // Don't allow deleting yourself
    if (params.id === user.id) {
      return NextResponse.json({ 
        error: 'Cannot delete your own account' 
      }, { status: 400 })
    }

    // Delete user record (cascades to subscriptions, scores, etc.)
    const { error } = await adminSupabase
      .from('users')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
