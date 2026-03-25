import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateScore } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_date', { ascending: false })
      .limit(5)

    if (error) throw error

    return NextResponse.json({ scores })
  } catch (error: any) {
    console.error('Scores fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Active subscription required to add scores' },
        { status: 403 }
      )
    }

    const { score, played_date } = await request.json()

    // Validate score
    if (!validateScore(score)) {
      return NextResponse.json(
        { error: 'Score must be between 1 and 45' },
        { status: 400 }
      )
    }

    // Validate date
    const playedDate = new Date(played_date)
    if (isNaN(playedDate.getTime()) || playedDate > new Date()) {
      return NextResponse.json(
        { error: 'Invalid date or date is in the future' },
        { status: 400 }
      )
    }

    // Insert score (trigger will handle keeping only 5)
    const { data: newScore, error } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        score,
        played_date,
      })
      .select()
      .single()

    if (error) throw error

    // Fetch updated scores
    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_date', { ascending: false })
      .limit(5)

    return NextResponse.json({ score: newScore, scores })
  } catch (error: any) {
    console.error('Score add error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add score' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, score, played_date } = await request.json()

    // Validate score
    if (!validateScore(score)) {
      return NextResponse.json(
        { error: 'Score must be between 1 and 45' },
        { status: 400 }
      )
    }

    // Update score
    const { data: updatedScore, error } = await supabase
      .from('scores')
      .update({ score, played_date })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ score: updatedScore })
  } catch (error: any) {
    console.error('Score update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update score' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Score ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Score delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete score' },
      { status: 500 }
    )
  }
}
