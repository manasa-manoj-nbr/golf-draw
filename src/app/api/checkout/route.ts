import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createStripeCustomer, createCheckoutSession, PLANS } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType } = await request.json()
    const plan = planType === 'yearly' ? PLANS.yearly : PLANS.monthly

    // Get or create Stripe customer
    let { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const customer = await createStripeCustomer(user.email!, profile?.full_name || undefined)
      customerId = customer.id

      // Save customer ID
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        plan_type: planType,
        status: 'inactive',
      }, {
        onConflict: 'user_id',
      })
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId,
      priceId: plan.priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      userId: user.id,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
