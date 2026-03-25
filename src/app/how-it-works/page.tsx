'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Target, 
  Trophy, 
  Heart,
  Calendar,
  Upload,
  Award,
  HelpCircle
} from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button, Card, CardContent, ScoreBallGroup } from '@/components/ui'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero */}
        <section className="py-20 bg-bauhaus-white relative overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-30" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
                How <span className="text-bauhaus-blue">GolfDraw</span> Works
              </h1>
              <p className="text-xl text-bauhaus-gray mb-8">
                A simple, transparent system that turns your golf scores into potential winnings while supporting causes you care about.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Step by Step */}
        <section className="py-20 bg-bauhaus-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-bauhaus-red rounded-full flex items-center justify-center text-2xl font-bold">
                      1
                    </div>
                    <h2 className="text-3xl font-bold">Subscribe to GolfDraw</h2>
                  </div>
                  <p className="text-white/70 text-lg mb-6">
                    Choose between our monthly ($14.99) or yearly ($129) plan. Your subscription is distributed as follows:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-bauhaus-red/20 rounded flex items-center justify-center">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <span><strong>50%</strong> goes to the prize pool</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-bauhaus-blue/20 rounded flex items-center justify-center">
                        <Heart className="w-4 h-4" />
                      </div>
                      <span><strong>10%+</strong> goes to your chosen charity</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-bauhaus-yellow/20 rounded flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <span><strong>40%</strong> supports platform operations</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white/5 border border-white/10 p-8">
                  <h3 className="text-xl font-bold mb-6">Your $14.99/month breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Prize Pool</span>
                      <span className="font-bold text-bauhaus-red">$7.50</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-bauhaus-red" style={{ width: '50%' }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Charity</span>
                      <span className="font-bold text-bauhaus-blue">$1.50+</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-bauhaus-blue" style={{ width: '10%' }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Platform</span>
                      <span className="font-bold text-bauhaus-yellow">$5.99</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-bauhaus-yellow" style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div className="order-2 md:order-1">
                  <div className="bg-white/5 border border-white/10 p-8">
                    <h3 className="text-xl font-bold mb-6">Your Score Dashboard</h3>
                    <div className="mb-6">
                      <ScoreBallGroup scores={[32, 28, 41, 35, 29]} />
                    </div>
                    <div className="text-center text-white/60">
                      <p className="text-sm">Latest 5 scores • Rolling system</p>
                      <p className="text-xs mt-2">New score replaces the oldest automatically</p>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-bauhaus-blue rounded-full flex items-center justify-center text-2xl font-bold">
                      2
                    </div>
                    <h2 className="text-3xl font-bold">Enter Your Golf Scores</h2>
                  </div>
                  <p className="text-white/70 text-lg mb-6">
                    Log your last 5 Stableford golf scores. Each score must be between 1-45 and include the date played.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Stableford format (1-45 points)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Only your latest 5 scores count</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Update scores anytime before draw</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Each score requires a played date</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-bauhaus-yellow text-bauhaus-black rounded-full flex items-center justify-center text-2xl font-bold">
                      3
                    </div>
                    <h2 className="text-3xl font-bold">Monthly Draw</h2>
                  </div>
                  <p className="text-white/70 text-lg mb-6">
                    At the end of each month, 5 winning numbers (1-45) are drawn. Your scores are compared against these numbers.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-bauhaus-yellow" />
                      <span>Draw happens on the last day of each month</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-bauhaus-yellow" />
                      <span>Random or algorithmic draw modes</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-bauhaus-yellow" />
                      <span>Multiple winners can share prizes</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white/5 border border-white/10 p-8">
                  <h3 className="text-xl font-bold mb-6 text-center">Prize Distribution</h3>
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-bauhaus-red/20 border border-bauhaus-red/40">
                      <p className="text-sm text-white/60">5-Number Match</p>
                      <p className="text-3xl font-bold">40% of Pool</p>
                      <p className="text-xs text-bauhaus-yellow mt-1">★ Jackpot rolls over if unclaimed</p>
                    </div>
                    <div className="text-center p-4 bg-bauhaus-blue/20 border border-bauhaus-blue/40">
                      <p className="text-sm text-white/60">4-Number Match</p>
                      <p className="text-3xl font-bold">35% of Pool</p>
                    </div>
                    <div className="text-center p-4 bg-bauhaus-yellow/20 border border-bauhaus-yellow/40">
                      <p className="text-sm text-white/60">3-Number Match</p>
                      <p className="text-3xl font-bold">25% of Pool</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 4 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div className="order-2 md:order-1">
                  <div className="bg-white/5 border border-white/10 p-8">
                    <h3 className="text-xl font-bold mb-6">Winner Verification</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-white/5">
                        <div className="w-10 h-10 bg-bauhaus-blue rounded-full flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">Upload Proof</p>
                          <p className="text-sm text-white/60">Screenshot from your golf app</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-white/5">
                        <div className="w-10 h-10 bg-bauhaus-yellow rounded-full flex items-center justify-center text-bauhaus-black">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">Admin Review</p>
                          <p className="text-sm text-white/60">Usually within 24-48 hours</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-white/5">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">Get Paid</p>
                          <p className="text-sm text-white/60">Direct transfer to your account</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl font-bold">
                      4
                    </div>
                    <h2 className="text-3xl font-bold">Win & Verify</h2>
                  </div>
                  <p className="text-white/70 text-lg mb-6">
                    If you win, you&apos;ll be notified immediately. Upload proof of your scores to claim your prize.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Email notification on winning</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Upload scorecard screenshot</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Admin verifies within 48 hours</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Prize paid directly to you</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-bauhaus-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl font-bold mb-4">
                Frequently Asked <span className="text-bauhaus-red">Questions</span>
              </h2>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  q: 'What is Stableford scoring?',
                  a: 'Stableford is a scoring system where points are awarded based on the number of strokes taken at each hole relative to par. Scores typically range from 0-45+ points per round.',
                },
                {
                  q: 'What if I don\'t play 5 rounds before the draw?',
                  a: 'You need at least 5 scores entered to participate in the draw. If you have fewer, your account will show you need more scores before the next draw.',
                },
                {
                  q: 'Can I change my scores after entering them?',
                  a: 'Yes, you can edit your scores up until the draw date. Once the draw occurs, scores are locked for that month.',
                },
                {
                  q: 'How are prizes split among multiple winners?',
                  a: 'If multiple people match the same number of scores, the prize pool for that tier is divided equally among all winners.',
                },
                {
                  q: 'What happens to the jackpot if no one wins?',
                  a: 'The 5-match jackpot rolls over to the next month, making it even bigger! 4-match and 3-match prizes do not roll over.',
                },
                {
                  q: 'Can I cancel my subscription anytime?',
                  a: 'Yes, you can cancel anytime. You\'ll retain access until the end of your billing period and can participate in that month\'s draw.',
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
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Join GolfDraw today and turn your golf game into prizes and charitable impact.
              </p>
              <Link href="/signup">
                <Button variant="accent" size="lg">
                  Subscribe Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
