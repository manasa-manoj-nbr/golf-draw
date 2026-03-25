'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Check, ArrowRight, Star, Shield, Zap, Heart } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 14.99,
    interval: 'month',
    description: 'Perfect for casual golfers',
    features: [
      'Enter all monthly draws',
      'Track your latest 5 scores',
      'Choose your charity',
      'Dashboard access',
      'Email notifications',
      'Cancel anytime',
    ],
    highlighted: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 129,
    interval: 'year',
    description: 'Best value for dedicated players',
    features: [
      'Everything in Monthly',
      '2 months FREE (save $50.88)',
      'Priority customer support',
      'Exclusive member events',
      'Early access to new features',
      'Bonus entries in special draws',
    ],
    highlighted: true,
    savings: '28%',
  },
]

const breakdown = {
  prizePool: 50,
  charity: 10,
  platform: 40,
}

export default function PricingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedPlan = searchParams.get('plan') || 'yearly'
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    selectedPlan === 'monthly' ? 'monthly' : 'yearly'
  )
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  const handleGetStarted = (planId: string) => {
    if (isLoggedIn) {
      router.push(`/checkout?plan=${planId}`)
    } else {
      router.push(`/signup?plan=${planId}`)
    }
  }

  const activePlan = plans.find((p) => p.id === billingCycle)!

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero */}
        <section className="py-20 bg-bauhaus-white relative overflow-hidden">
          <div className="absolute inset-0 pattern-grid opacity-30" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
                Simple, <span className="text-bauhaus-blue">Transparent</span> Pricing
              </h1>
              <p className="text-xl text-bauhaus-gray mb-8">
                One subscription, three ways to make an impact: win prizes, support charities, and enjoy the game.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center bg-bauhaus-black/5 p-1 rounded-none border-2 border-bauhaus-black">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 font-bold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-bauhaus-black text-white'
                      : 'text-bauhaus-black hover:bg-bauhaus-black/10'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 font-bold transition-all flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-bauhaus-black text-white'
                      : 'text-bauhaus-black hover:bg-bauhaus-black/10'
                  }`}
                >
                  Yearly
                  <Badge variant="success" size="sm">Save 28%</Badge>
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 bg-bauhaus-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${plan.id === billingCycle ? 'z-10' : 'opacity-75'}`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge variant="error" className="px-4 py-1">
                        <Star className="w-4 h-4 mr-1 inline" />
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <Card 
                    className={`h-full ${plan.highlighted ? 'border-bauhaus-red border-2' : ''}`}
                    hover={false}
                  >
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                      <p className="text-bauhaus-gray mb-6">{plan.description}</p>
                      
                      <div className="mb-6">
                        <span className="text-5xl font-bold">{formatCurrency(plan.price)}</span>
                        <span className="text-bauhaus-gray">/{plan.interval}</span>
                        {plan.savings && (
                          <Badge variant="success" className="ml-3">
                            Save {plan.savings}
                          </Badge>
                        )}
                      </div>

                      {plan.id === 'yearly' && (
                        <p className="text-sm text-bauhaus-gray mb-6">
                          That&apos;s just {formatCurrency(plan.price / 12)}/month
                        </p>
                      )}

                      <Button 
                        variant={plan.highlighted ? 'primary' : 'outline'} 
                        className="w-full mb-8"
                        size="lg"
                        onClick={() => handleGetStarted(plan.id)}
                      >
                        Get Started
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>

                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How Your Subscription Works */}
        <section className="py-20 bg-bauhaus-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl font-bold mb-4">
                Where Your <span className="text-bauhaus-yellow">Money</span> Goes
              </h2>
              <p className="text-white/70 text-lg">
                Every subscription is split transparently between prizes, charity, and platform operations.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {/* Visual Breakdown */}
              <div className="mb-12">
                <div className="h-8 flex overflow-hidden border-2 border-white">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${breakdown.prizePool}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-bauhaus-red flex items-center justify-center"
                  >
                    <span className="text-sm font-bold">50%</span>
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${breakdown.charity}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-bauhaus-blue flex items-center justify-center"
                  >
                    <span className="text-sm font-bold">10%+</span>
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${breakdown.platform}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="bg-bauhaus-yellow text-bauhaus-black flex items-center justify-center"
                  >
                    <span className="text-sm font-bold">40%</span>
                  </motion.div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-bauhaus-red rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Prize Pool</h3>
                  <p className="text-3xl font-bold text-bauhaus-red mb-2">50%</p>
                  <p className="text-white/60 text-sm">
                    {formatCurrency(activePlan.price * 0.5)} per {activePlan.interval}
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    Funds the monthly draw prizes
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-bauhaus-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Charity</h3>
                  <p className="text-3xl font-bold text-bauhaus-blue mb-2">10%+</p>
                  <p className="text-white/60 text-sm">
                    {formatCurrency(activePlan.price * 0.1)}+ per {activePlan.interval}
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    You choose the charity and can give more
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-bauhaus-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-bauhaus-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Platform</h3>
                  <p className="text-3xl font-bold text-bauhaus-yellow mb-2">40%</p>
                  <p className="text-white/60 text-sm">
                    {formatCurrency(activePlan.price * 0.4)} per {activePlan.interval}
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    Operations, development, support
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-20 bg-bauhaus-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl font-bold mb-4">
                What You <span className="text-bauhaus-red">Get</span>
              </h2>
            </motion.div>

            <Card hover={false}>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-bauhaus-black">
                      <th className="text-left p-4 font-bold">Feature</th>
                      <th className="text-center p-4 font-bold">Monthly</th>
                      <th className="text-center p-4 font-bold bg-bauhaus-red/5">Yearly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Monthly Draw Entries', monthly: true, yearly: true },
                      { feature: 'Score Tracking (5 scores)', monthly: true, yearly: true },
                      { feature: 'Charity Selection', monthly: true, yearly: true },
                      { feature: 'Personal Dashboard', monthly: true, yearly: true },
                      { feature: 'Email Notifications', monthly: true, yearly: true },
                      { feature: 'Priority Support', monthly: false, yearly: true },
                      { feature: 'Exclusive Events', monthly: false, yearly: true },
                      { feature: 'Early Feature Access', monthly: false, yearly: true },
                      { feature: 'Bonus Draw Entries', monthly: false, yearly: true },
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-bauhaus-black/10">
                        <td className="p-4">{row.feature}</td>
                        <td className="text-center p-4">
                          {row.monthly ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-bauhaus-gray">—</span>
                          )}
                        </td>
                        <td className="text-center p-4 bg-bauhaus-red/5">
                          {row.yearly ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-bauhaus-gray">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-bauhaus-black text-white">
                      <td className="p-4 font-bold">Price</td>
                      <td className="text-center p-4 font-bold">$14.99/mo</td>
                      <td className="text-center p-4 font-bold bg-bauhaus-red">
                        $129/yr
                        <span className="block text-xs font-normal">($10.75/mo)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-bauhaus-light-gray">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl font-bold mb-4">
                Pricing <span className="text-bauhaus-blue">FAQ</span>
              </h2>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  q: 'Can I switch between plans?',
                  a: 'Yes! You can upgrade from monthly to yearly at any time. The remaining value of your monthly subscription will be prorated.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure Stripe payment system.',
                },
                {
                  q: 'Is there a free trial?',
                  a: 'We don\'t offer a free trial, but you can cancel your subscription anytime within the first 7 days for a full refund.',
                },
                {
                  q: 'What happens if I cancel?',
                  a: 'You\'ll retain access until the end of your billing period. You can still participate in that month\'s draw, but won\'t be billed again.',
                },
                {
                  q: 'Can I increase my charity contribution?',
                  a: 'Absolutely! The 10% is the minimum. You can increase your charity percentage anytime from your dashboard.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover={false}>
                    <CardContent>
                      <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                      <p className="text-bauhaus-gray">{faq.a}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-bauhaus-red text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Ready to Start Winning?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Join thousands of golfers who are making their game count.
              </p>
              <Button variant="accent" size="lg" onClick={() => handleGetStarted('yearly')}>
                Get Started — Save 28% with Yearly
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
