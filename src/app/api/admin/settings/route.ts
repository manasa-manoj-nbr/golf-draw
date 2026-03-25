import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// For now, store settings in memory (in production, use a settings table)
// This is a simplified implementation
let adminSettings = {
  draw_day: 'last_friday',
  draw_time: '20:00',
  default_draw_type: 'random',
  auto_publish_results: false,
  email_notifications: true,
  winner_notifications: true,
  draw_reminders: true,
}

// GET /api/admin/settings - Get admin settings
export async function GET(request: Request) {
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

    // In a real implementation, fetch from a settings table
    // For now, return in-memory settings with pricing config
    return NextResponse.json({
      settings: adminSettings,
      pricing: {
        monthly: 14.99,
        yearly: 129.00,
        yearly_savings: 50.88,
      },
      prize_distribution: {
        prize_pool_percentage: 50,
        charity_minimum: 10,
        platform_revenue: 40,
        five_match: 40,
        four_match: 35,
        three_match: 25,
      }
    })
  } catch (error: any) {
    console.error('Admin settings get error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/settings - Update admin settings
export async function PUT(request: Request) {
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
    
    // Update settings
    if (body.draw_day !== undefined) adminSettings.draw_day = body.draw_day
    if (body.draw_time !== undefined) adminSettings.draw_time = body.draw_time
    if (body.default_draw_type !== undefined) adminSettings.default_draw_type = body.default_draw_type
    if (body.auto_publish_results !== undefined) adminSettings.auto_publish_results = body.auto_publish_results
    if (body.email_notifications !== undefined) adminSettings.email_notifications = body.email_notifications
    if (body.winner_notifications !== undefined) adminSettings.winner_notifications = body.winner_notifications
    if (body.draw_reminders !== undefined) adminSettings.draw_reminders = body.draw_reminders

    return NextResponse.json({ 
      success: true,
      settings: adminSettings 
    })
  } catch (error: any) {
    console.error('Admin settings update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
