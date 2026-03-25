import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// This endpoint syncs the user's subscription status from Stripe
// Useful when webhooks don't work (e.g., local development)
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Syncing subscription for user:', user.id, user.email)

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

    // FIRST: Make sure user exists in users table with CORRECT id
    const { data: existingUser } = await adminSupabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      console.log('User not found in users table with correct ID, checking by email...')
      
      // Check if there's a user with the same email but different ID (orphaned record)
      const { data: orphanedUser } = await adminSupabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()
      
      if (orphanedUser && orphanedUser.id !== user.id) {
        console.log('Found orphaned user record, deleting...')
        // Delete orphaned subscriptions first (foreign key constraint)
        await adminSupabase
          .from('subscriptions')
          .delete()
          .eq('user_id', orphanedUser.id)
        // Delete orphaned user
        await adminSupabase
          .from('users')
          .delete()
          .eq('id', orphanedUser.id)
      }

      // Create user with correct auth ID
      console.log('Creating user with correct ID:', user.id)
      const { error: userInsertError } = await adminSupabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
        })
      
      if (userInsertError) {
        console.error('Failed to create user record:', userInsertError)
        return NextResponse.json({ 
          error: 'Failed to create user record',
          details: userInsertError.message,
          code: userInsertError.code
        }, { status: 500 })
      }
      console.log('User record created successfully')
    }

    // Try to find Stripe customer by email
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    })
    
    if (customers.data.length === 0) {
      return NextResponse.json({ 
        message: 'No Stripe customer found for your email. Please complete checkout first.',
        synced: false,
        debug: { email: user.email }
      })
    }

    const customerId = customers.data[0].id
    console.log('Found Stripe customer:', customerId)

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    })

    console.log('Found subscriptions:', subscriptions.data.length)

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ 
        message: 'No subscriptions found for this customer.',
        synced: false,
        debug: { customerId }
      })
    }

    // Get the most recent active subscription, or the most recent one
    let stripeSubscription = subscriptions.data.find(s => s.status === 'active')
    if (!stripeSubscription) {
      stripeSubscription = subscriptions.data[0]
    }

    console.log('Using subscription:', stripeSubscription.id, stripeSubscription.status)

    const priceId = stripeSubscription.items.data[0].price.id
    const planType = priceId === process.env.STRIPE_YEARLY_PRICE_ID ? 'yearly' : 'monthly'
    
    // Map Stripe status to our status
    let status: 'active' | 'inactive' | 'canceled' | 'past_due' = 'inactive'
    switch (stripeSubscription.status) {
      case 'active':
      case 'trialing':
        status = 'active'
        break
      case 'past_due':
        status = 'past_due'
        break
      case 'canceled':
      case 'unpaid':
        status = 'canceled'
        break
      default:
        status = 'inactive'
    }

    // Delete any existing subscription for this user (to handle mismatched records)
    console.log('Removing any existing subscription records for user:', user.id)
    await adminSupabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id)

    // Insert fresh subscription record
    console.log('Inserting new subscription record')
    const subscriptionData = {
      user_id: user.id,
      plan_type: planType,
      status: status,
      stripe_customer_id: customerId,
      stripe_subscription_id: stripeSubscription.id,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    }

    const { error: insertError } = await adminSupabase
      .from('subscriptions')
      .insert(subscriptionData)

    if (insertError) {
      console.error('Subscription insert error:', insertError)
      return NextResponse.json({ 
        error: 'Failed to create subscription record',
        details: insertError.message,
        code: insertError.code,
        debug: {
          userId: user.id,
          customerId,
          subscriptionId: stripeSubscription.id,
          status,
          planType
        }
      }, { status: 500 })
    }

    console.log('Subscription synced successfully!')

    return NextResponse.json({ 
      message: 'Subscription synced successfully!',
      synced: true,
      subscription: {
        status,
        plan_type: planType,
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      }
    })
  } catch (error: any) {
    console.error('Subscription sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscription', stack: error.stack },
      { status: 500 }
    )
  }
}
