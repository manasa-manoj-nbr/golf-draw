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

// GET - Get single charity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const admin = await verifyAdmin(supabase)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: charity, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ data: charity })
  } catch (error) {
    console.error('Charity GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Full update charity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const admin = await verifyAdmin(supabase)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, image_url, website, is_featured, is_active, events } = body

    const { data: charity, error } = await supabase
      .from('charities')
      .update({
        name,
        description,
        image_url: image_url || null,
        website: website || null,
        is_featured: is_featured || false,
        is_active: is_active !== false,
        events: events || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: charity })
  } catch (error) {
    console.error('Charity PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Partial update charity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const admin = await verifyAdmin(supabase)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: charity, error } = await supabase
      .from('charities')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: charity })
  } catch (error) {
    console.error('Charity PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete charity
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const admin = await verifyAdmin(supabase)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if any users are associated with this charity
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('charity_id', params.id)

    if (count && count > 0) {
      // Instead of deleting, deactivate
      const { error } = await supabase
        .from('charities')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', params.id)

      if (error) throw error

      return NextResponse.json({ 
        message: 'Charity has been deactivated as it has associated users',
        deactivated: true 
      })
    }

    const { error } = await supabase
      .from('charities')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ message: 'Charity deleted successfully' })
  } catch (error) {
    console.error('Charity DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
