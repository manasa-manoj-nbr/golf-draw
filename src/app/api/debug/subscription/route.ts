import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Debug endpoint to check subscription data via both normal and admin client
export async function GET() {
  try {
    const supabase = createClient()
    const adminSupabase = createAdminClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json({ 
        error: 'Auth error',
        details: authError.message 
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    // Fetch with regular client (respects RLS)
    const { data: subWithRLS, error: rlsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Fetch with admin client (bypasses RLS)
    const { data: subWithAdmin, error: adminError } = await adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Fetch user record with regular client
    const { data: userWithRLS, error: userRlsError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Fetch user record with admin client
    const { data: userWithAdmin, error: userAdminError } = await adminSupabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      auth: {
        userId: user.id,
        email: user.email,
      },
      userRecord: {
        withRLS: userWithRLS,
        rlsError: userRlsError?.message,
        withAdmin: userWithAdmin,
        adminError: userAdminError?.message,
      },
      subscription: {
        withRLS: subWithRLS,
        rlsError: rlsError?.message,
        withAdmin: subWithAdmin,
        adminError: adminError?.message,
      },
      diagnosis: {
        userExists: !!userWithAdmin,
        subscriptionExists: !!subWithAdmin,
        rlsBlockingUser: !userWithRLS && !!userWithAdmin,
        rlsBlockingSubscription: !subWithRLS && !!subWithAdmin,
        idMatch: subWithAdmin?.user_id === user.id,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
