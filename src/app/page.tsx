'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Trophy, 
  Heart, 
  Target, 
  Calendar, 
  Users,
  Check,
  Star,
  Zap
} from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button, Card, CardContent, ScoreBallGroup } from '@/components/ui'
import { formatCurrency, daysUntilDraw } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  const router = useRouter()
  const daysLeft = daysUntilDraw()
  const exampleScores = [32, 28, 41, 35, 29]
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  const handleSubscribe = (plan?: string) => {
    const planParam = plan || 'yearly'
    if (isLoggedIn) {
      router.push(`/checkout?plan=${planParam}`)
    } else {
      router.push(`/signup?plan=${planParam}`)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-bauhaus-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 pattern-grid opacity-50" />
          
          {/* Decorative Shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-bauhaus-red/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-bauhaus-blue/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-bauhaus-yellow/10 rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="text-center md:text-left"
              >
                <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                  <div className="w-4 h-4 bg-bauhaus-red rounded-full" />
                  <div className="w-4 h-4 bg-bauhaus-blue rounded-full" />
                  <div className="w-4 h-4 bg-bauhaus-yellow rounded-full" />
                </motion.div>
                
                <motion.h1 
                  variants={fadeInUp}
                  className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
                >
                  PLAY.
                  <span className="text-bauhaus-red"> WIN.</span>
                  <br />
                  <span className="text-bauhaus-blue">GIVE BACK.</span>
                </motion.h1>
                
                <motion.p 
                  variants={fadeInUp}
                  className="text-xl text-bauhaus-gray mb-8 max-w-lg"
                >
                  Your golf scores could win big and change lives. Enter your Stableford scores, match the monthly draw, and support charities you care about.
                </motion.p>
                
                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                >
                  <Button size="lg" className="w-full sm:w-auto" onClick={() => handleSubscribe()}>
                    Subscribe Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Link href="/how-it-works">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      How It Works
                    </Button>
                  </Link>
                </motion.div>

                <motion.div 
                  variants={fadeInUp}
                  className="mt-8 flex items-center gap-6 justify-center md:justify-start text-sm text-bauhaus-gray"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>50% to Prize Pool</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>10%+ to Charity</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Content - Score Card Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative"
              >
                <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus-lg p-8 relative">
                  {/* Decorative corner */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-bauhaus-yellow border-2 border-bauhaus-black" />
                  
                  <h3 className="font-bold text-lg mb-6">Your Scores Could Look Like This</h3>
                  
                  <div className="mb-6">
                    <ScoreBallGroup scores={exampleScores} animated />
                  </div>
                  
                  <div className="border-t-2 border-bauhaus-black/10 pt-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-bauhaus-gray">Next Draw In</span>
                      <span className="font-bold text-2xl text-bauhaus-red">{daysLeft} Days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-bauhaus-gray">Current Jackpot</span>
                      <span className="font-bold text-2xl text-bauhaus-blue">{formatCurrency(12500)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-bauhaus-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                How It <span className="text-bauhaus-yellow">Works</span>
              </h2>
              <p className="text-bauhaus-gray text-lg max-w-2xl mx-auto">
                Simple, fair, and impactful. Here&apos;s how your golf game can make a difference.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Subscribe',
                  description: 'Choose monthly ($14.99) or yearly ($129) plan',
                  icon: Users,
                  color: 'bg-bauhaus-red',
                },
                {
                  step: '02',
                  title: 'Enter Scores',
                  description: 'Log your last 5 Stableford golf scores (1-45)',
                  icon: Target,
                  color: 'bg-bauhaus-blue',
                },
                {
                  step: '03',
                  title: 'Match Numbers',
                  description: 'Your scores are matched against monthly draw',
                  icon: Trophy,
                  color: 'bg-bauhaus-yellow',
                },
                {
                  step: '04',
                  title: 'Win & Give',
                  description: 'Win prizes while supporting your chosen charity',
                  icon: Heart,
                  color: 'bg-green-500',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Connector Line */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-white/20" />
                  )}
                  
                  <div className="text-center">
                    <div className={`${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-bauhaus-gray text-sm font-bold">{item.step}</span>
                    <h3 className="font-bold text-xl mt-2 mb-2">{item.title}</h3>
                    <p className="text-bauhaus-gray">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Prize Pool Section */}
        <section className="py-20 bg-bauhaus-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Prize <span className="text-bauhaus-red">Pool</span> Distribution
              </h2>
              <p className="text-bauhaus-gray text-lg max-w-2xl mx-auto">
                50% of every subscription goes directly to the prize pool. The more subscribers, the bigger the prizes.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  match: '5-Number Match',
                  percentage: '40%',
                  description: 'Match all 5 numbers to win the jackpot. Rolls over if unclaimed!',
                  color: 'border-bauhaus-red',
                  bgColor: 'bg-bauhaus-red/5',
                  icon: '★★★★★',
                },
                {
                  match: '4-Number Match',
                  percentage: '35%',
                  description: 'Match 4 numbers for a substantial prize. Split among all winners.',
                  color: 'border-bauhaus-blue',
                  bgColor: 'bg-bauhaus-blue/5',
                  icon: '★★★★',
                },
                {
                  match: '3-Number Match',
                  percentage: '25%',
                  description: 'Match 3 numbers for a prize. More chances to win!',
                  color: 'border-bauhaus-yellow',
                  bgColor: 'bg-bauhaus-yellow/5',
                  icon: '★★★',
                },
              ].map((pool, index) => (
                <motion.div
                  key={pool.match}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full border-l-4 ${pool.color} ${pool.bgColor}`}>
                    <CardContent>
                      <div className="text-2xl mb-2">{pool.icon}</div>
                      <h3 className="font-bold text-xl mb-2">{pool.match}</h3>
                      <p className="text-4xl font-bold mb-4">{pool.percentage}</p>
                      <p className="text-bauhaus-gray">{pool.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Charity Section */}
        <section className="py-20 bg-bauhaus-blue text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                  Golf for <span className="text-bauhaus-yellow">Good</span>
                </h2>
                <p className="text-white/80 text-lg mb-6">
                  At least 10% of your subscription goes directly to a charity of your choice. You can increase this percentage anytime.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'Choose from our curated charity directory',
                    'Change your charity selection anytime',
                    'Track your total contributions',
                    'Make independent donations too',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-bauhaus-yellow rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-bauhaus-black" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/charities">
                  <Button variant="accent" size="lg">
                    Explore Charities
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { label: 'Total Donated', value: '$125,000+', icon: Heart },
                  { label: 'Charities Supported', value: '12', icon: Users },
                  { label: 'Avg. Contribution', value: '$15/mo', icon: Zap },
                  { label: 'Happy Donors', value: '2,500+', icon: Star },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 text-center"
                  >
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-bauhaus-yellow" />
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-white/60 text-sm">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="py-20 bg-bauhaus-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Simple <span className="text-bauhaus-blue">Pricing</span>
              </h2>
              <p className="text-bauhaus-gray text-lg max-w-2xl mx-auto">
                Choose the plan that works for you. Cancel anytime.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Monthly */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent>
                    <h3 className="font-bold text-xl mb-2">Monthly</h3>
                    <p className="text-bauhaus-gray mb-4">Flexible month-to-month</p>
                    <p className="text-5xl font-bold mb-6">
                      $14.99
                      <span className="text-lg font-normal text-bauhaus-gray">/mo</span>
                    </p>
                    <ul className="space-y-3 mb-8">
                      {[
                        'Enter monthly draws',
                        'Track your scores',
                        'Support a charity',
                        'Cancel anytime',
                      ].map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full" onClick={() => handleSubscribe('monthly')}>
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Yearly */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full border-bauhaus-red relative">
                  <div className="absolute -top-3 -right-3 bg-bauhaus-red text-white px-3 py-1 text-sm font-bold border-2 border-bauhaus-black">
                    SAVE 28%
                  </div>
                  <CardContent>
                    <h3 className="font-bold text-xl mb-2">Yearly</h3>
                    <p className="text-bauhaus-gray mb-4">Best value for committed players</p>
                    <p className="text-5xl font-bold mb-6">
                      $129
                      <span className="text-lg font-normal text-bauhaus-gray">/yr</span>
                    </p>
                    <ul className="space-y-3 mb-8">
                      {[
                        'All monthly features',
                        '2 months FREE',
                        'Priority support',
                        'Exclusive events access',
                      ].map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" onClick={() => handleSubscribe('yearly')}>
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-bauhaus-yellow">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-bauhaus-black">
                Ready to Play for a Cause?
              </h2>
              <p className="text-xl text-bauhaus-black/70 mb-8 max-w-2xl mx-auto">
                Join thousands of golfers who are winning prizes and making a difference. The next draw is just {daysLeft} days away.
              </p>
              <Button size="lg" className="bg-bauhaus-black hover:bg-bauhaus-black/90" onClick={() => handleSubscribe('monthly')}>
                Subscribe Now — {formatCurrency(14.99)}/month
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
