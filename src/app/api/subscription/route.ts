import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createBillingPortalSession, cancelSubscription, reactivateSubscription } from '@/lib/stripe'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS issues
    const adminSupabase = createAdminClient()
    const { data: subscription } = await adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ subscription })
  } catch (error: any) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
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

    const { action } = await request.json()

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    switch (action) {
      case 'portal': {
        const session = await createBillingPortalSession(
          subscription.stripe_customer_id,
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
        )
        return NextResponse.json({ url: session.url })
      }
      case 'cancel': {
        if (!subscription.stripe_subscription_id) {
          return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
        }
        await cancelSubscription(subscription.stripe_subscription_id)
        return NextResponse.json({ success: true })
      }
      case 'reactivate': {
        if (!subscription.stripe_subscription_id) {
          return NextResponse.json({ error: 'No subscription to reactivate' }, { status: 400 })
        }
        await reactivateSubscription(subscription.stripe_subscription_id)
        return NextResponse.json({ success: true })
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Subscription action error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process subscription action' },
      { status: 500 }
    )
  }
}
