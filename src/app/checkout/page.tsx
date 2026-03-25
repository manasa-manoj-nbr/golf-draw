'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, CreditCard, Shield, Check } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planType = searchParams.get('plan') || 'yearly'
  
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [error, setError] = useState('')
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)

  const plan = planType === 'yearly'
    ? { name: 'Yearly', price: 129, interval: 'year' }
    : { name: 'Monthly', price: 14.99, interval: 'month' }

  useEffect(() => {
    // Check if user is authenticated and check subscription status
    const checkAuthAndSubscription = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push(`/signup?plan=${planType}`)
        return
      }

      // Check for existing active subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (subscription) {
        setHasActiveSubscription(true)
      }
      
      setIsLoading(false)
    }
    
    checkAuthAndSubscription()
  }, [router, planType])

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    setError('')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4 bg-bauhaus-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-bauhaus-blue" />
        </main>
        <Footer />
      </div>
    )
  }

  if (hasActiveSubscription) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4 bg-bauhaus-white pattern-dots">
          <div className="max-w-lg mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-bauhaus-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">You Already Have a Subscription!</h1>
                <p className="text-bauhaus-gray mb-6">
                  You already have an active subscription. Go to your dashboard to manage it.
                </p>
                <Button onClick={() => router.push('/dashboard')} className="w-full">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4 bg-bauhaus-white pattern-dots">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-bauhaus-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold">Complete Your Subscription</h1>
                  <p className="text-bauhaus-gray mt-2">You&apos;re one step away from joining GolfDraw</p>
                </div>

                {/* Order Summary */}
                <div className="bg-bauhaus-black/5 p-6 mb-6">
                  <h2 className="font-bold mb-4">Order Summary</h2>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-medium">{plan.name} Subscription</p>
                      <p className="text-sm text-bauhaus-gray">Billed {plan.interval}ly</p>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(plan.price)}</p>
                  </div>
                  
                  <div className="border-t border-bauhaus-black/10 pt-4">
                    <h3 className="text-sm font-bold mb-2">Your contribution breakdown:</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-bauhaus-gray">Prize Pool (50%)</span>
                        <span className="text-bauhaus-red font-medium">
                          {formatCurrency(plan.price * 0.5)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-bauhaus-gray">Charity (10%)</span>
                        <span className="text-bauhaus-blue font-medium">
                          {formatCurrency(plan.price * 0.1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-bauhaus-gray">Platform (40%)</span>
                        <span className="text-bauhaus-yellow font-medium">
                          {formatCurrency(plan.price * 0.4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What you get */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3">What you&apos;ll get:</h3>
                  <ul className="space-y-2">
                    {[
                      'Entry to all monthly prize draws',
                      'Track your golf scores',
                      'Support your chosen charity',
                      'Personal dashboard',
                      'Winner notifications',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-bauhaus-red/10 border-2 border-bauhaus-red text-bauhaus-red text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full"
                  size="lg"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Redirecting to checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay {formatCurrency(plan.price)}
                    </>
                  )}
                </Button>

                {/* Security note */}
                <div className="flex items-center justify-center gap-2 mt-6 text-xs text-bauhaus-gray">
                  <Shield className="w-4 h-4" />
                  <span>Secured by Stripe. Cancel anytime.</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
