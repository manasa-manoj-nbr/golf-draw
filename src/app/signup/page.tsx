'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button, Input, Card, CardContent, Badge } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

const plans = {
  monthly: { name: 'Monthly', price: 14.99, interval: 'month' },
  yearly: { name: 'Yearly', price: 129, interval: 'year', savings: '28%' },
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(
    planParam === 'monthly' ? 'monthly' : 'yearly'
  )
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const plan = plans[selectedPlan]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Redirect to checkout with plan info
      router.push(`/checkout?plan=${selectedPlan}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4 bg-bauhaus-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-12 items-start"
          >
            {/* Left: Sign Up Form */}
            <Card>
              <CardContent className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex justify-center gap-1 mb-4">
                    <div className="w-3 h-3 bg-bauhaus-red rounded-full" />
                    <div className="w-3 h-3 bg-bauhaus-blue rounded-full" />
                    <div className="w-3 h-3 bg-bauhaus-yellow rounded-full" />
                  </div>
                  <h1 className="text-2xl font-bold">Create Your Account</h1>
                  <p className="text-bauhaus-gray mt-2">Join GolfDraw and start winning today</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-bauhaus-red/10 border-2 border-bauhaus-red text-bauhaus-red flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bauhaus-gray" />
                      <Input
                        type="text"
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-12"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bauhaus-gray" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bauhaus-gray" />
                      <Input
                        type="password"
                        placeholder="Password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bauhaus-gray" />
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                  >
                    Create Account & Continue
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>

                {/* Terms */}
                <p className="text-xs text-bauhaus-gray text-center mt-6">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-bauhaus-blue hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-bauhaus-blue hover:underline">
                    Privacy Policy
                  </Link>
                </p>

                {/* Sign In Link */}
                <p className="text-center text-bauhaus-gray mt-6">
                  Already have an account?{' '}
                  <Link href="/login" className="text-bauhaus-red font-bold hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Right: Plan Selection */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Select Your Plan</h2>
              
              <div className="space-y-4">
                {/* Monthly */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('monthly')}
                  className={`w-full text-left p-6 border-2 transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-bauhaus-red bg-bauhaus-red/5'
                      : 'border-bauhaus-black/20 hover:border-bauhaus-black/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">Monthly</h3>
                      <p className="text-bauhaus-gray text-sm">Flexible month-to-month</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(14.99)}</p>
                      <p className="text-bauhaus-gray text-sm">/month</p>
                    </div>
                  </div>
                  {selectedPlan === 'monthly' && (
                    <div className="mt-4 pt-4 border-t border-bauhaus-red/20">
                      <div className="flex items-center gap-2 text-sm text-bauhaus-gray">
                        <Check className="w-4 h-4 text-green-500" />
                        Cancel anytime
                      </div>
                    </div>
                  )}
                </button>

                {/* Yearly */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('yearly')}
                  className={`w-full text-left p-6 border-2 transition-all relative ${
                    selectedPlan === 'yearly'
                      ? 'border-bauhaus-red bg-bauhaus-red/5'
                      : 'border-bauhaus-black/20 hover:border-bauhaus-black/40'
                  }`}
                >
                  <Badge variant="success" className="absolute -top-3 right-4">
                    SAVE 28%
                  </Badge>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">Yearly</h3>
                      <p className="text-bauhaus-gray text-sm">Best value — 2 months free</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(129)}</p>
                      <p className="text-bauhaus-gray text-sm">/year</p>
                    </div>
                  </div>
                  {selectedPlan === 'yearly' && (
                    <div className="mt-4 pt-4 border-t border-bauhaus-red/20">
                      <div className="flex items-center gap-2 text-sm text-bauhaus-gray">
                        <Check className="w-4 h-4 text-green-500" />
                        Only {formatCurrency(129 / 12)}/month
                      </div>
                    </div>
                  )}
                </button>
              </div>

              {/* What's Included */}
              <Card variant="blue" hover={false}>
                <CardContent>
                  <h3 className="font-bold mb-4">What&apos;s Included</h3>
                  <ul className="space-y-3">
                    {[
                      'Entry to all monthly prize draws',
                      'Track your last 5 golf scores',
                      'Choose & support a charity',
                      'Personal dashboard',
                      'Winner notifications',
                      'Secure score verification',
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-bauhaus-blue" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Breakdown */}
              <div className="p-4 bg-bauhaus-black text-white">
                <h3 className="font-bold mb-4">Your {plan.name} Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prize Pool (50%)</span>
                    <span className="text-bauhaus-red">{formatCurrency(plan.price * 0.5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Charity (10%+)</span>
                    <span className="text-bauhaus-blue">{formatCurrency(plan.price * 0.1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform (40%)</span>
                    <span className="text-bauhaus-yellow">{formatCurrency(plan.price * 0.4)}</span>
                  </div>
                  <div className="border-t border-white/20 pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(plan.price)}/{plan.interval}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
