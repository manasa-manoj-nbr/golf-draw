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

// POST - Create new charity
export async function POST(request: NextRequest) {
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
      .insert({
        name,
        description,
        image_url: image_url || null,
        website: website || null,
        is_featured: is_featured || false,
        is_active: is_active !== false,
        events: events || [],
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: charity })
  } catch (error) {
    console.error('Charity POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - List all charities
export async function GET() {
  try {
    const supabase = createClient()
    const admin = await verifyAdmin(supabase)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: charities, error } = await supabase
      .from('charities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: charities })
  } catch (error) {
    console.error('Charity GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
