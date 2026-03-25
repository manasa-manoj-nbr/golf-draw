'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Target, 
  Heart, 
  Trophy, 
  Award, 
  Calendar,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, ScoreBallGroup } from '@/components/ui'
import { formatCurrency, formatDate, daysUntilDraw, formatRelativeDate } from '@/lib/utils'
import type { User, Subscription, Score, Winner, Draw, Charity } from '@/types'

interface DashboardOverviewProps {
  profile: (User & { charity: Charity | null }) | null
  subscription: Subscription | null
  scores: Score[]
  winnings: Winner[]
  latestDraw: Draw | null
  totalWinnings: number
  pendingPayouts: number
}

export function DashboardOverview({
  profile,
  subscription,
  scores,
  winnings,
  latestDraw,
  totalWinnings,
  pendingPayouts,
}: DashboardOverviewProps) {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  
  const daysLeft = daysUntilDraw()
  const isSubscribed = subscription?.status === 'active'
  const hasEnoughScores = scores.length >= 5
  const scoreValues = scores.map(s => s.score)

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  }

  const handleSyncSubscription = async () => {
    setIsSyncing(true)
    setSyncMessage('')
    
    try {
      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
      })
      const data = await response.json()
      
      console.log('Sync response:', data)
      
      if (data.synced) {
        setSyncMessage('Subscription synced! Refreshing...')
        // Use window.location.reload() for a full page refresh
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else if (data.error) {
        setSyncMessage(`Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`)
        console.error('Sync error details:', data)
      } else {
        setSyncMessage(data.message || 'Sync failed')
      }
    } catch (error: any) {
      console.error('Sync fetch error:', error)
      setSyncMessage(`Failed to sync: ${error.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {!isSubscribed && (
        <motion.div {...fadeInUp} className="p-4 bg-bauhaus-yellow border-2 border-bauhaus-black">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">No Active Subscription</p>
              <p className="text-sm">Subscribe to enter monthly draws and start winning!</p>
              <p className="text-xs text-bauhaus-gray mt-1">
                Already subscribed? 
                <button 
                  onClick={handleSyncSubscription}
                  disabled={isSyncing}
                  className="ml-1 underline hover:text-bauhaus-black inline-flex items-center"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Click to sync
                    </>
                  )}
                </button>
              </p>
              {syncMessage && (
                <p className="text-xs mt-1 font-medium">{syncMessage}</p>
              )}
            </div>
            <Link href="/pricing">
              <Button size="sm">Subscribe Now</Button>
            </Link>
          </div>
        </motion.div>
      )}

      {isSubscribed && !hasEnoughScores && (
        <motion.div {...fadeInUp} className="p-4 bg-bauhaus-blue/10 border-2 border-bauhaus-blue">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-bauhaus-blue flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-bauhaus-blue">Add More Scores</p>
              <p className="text-sm">You need {5 - scores.length} more score(s) to enter the next draw.</p>
            </div>
            <Link href="/dashboard/scores">
              <Button variant="secondary" size="sm">Add Scores</Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card variant="red">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-red/10 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-bauhaus-red" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Next Draw In</p>
                <p className="text-2xl font-bold">{daysLeft} Days</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <Card variant="blue">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-blue/10 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-bauhaus-blue" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Your Scores</p>
                <p className="text-2xl font-bold">{scores.length}/5</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
          <Card variant="yellow">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-yellow/20 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-bauhaus-black" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Total Winnings</p>
                <p className="text-2xl font-bold">{formatCurrency(totalWinnings)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Charity Contribution</p>
                <p className="text-2xl font-bold">{profile?.charity_percentage || 10}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scores Card */}
        <motion.div {...fadeInUp} transition={{ delay: 0.5 }} className="lg:col-span-2">
          <Card hover={false}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Current Scores</CardTitle>
              <Link href="/dashboard/scores">
                <Button variant="ghost" size="sm">
                  Manage <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {scores.length > 0 ? (
                <div className="space-y-6">
                  <ScoreBallGroup scores={scoreValues} animated />
                  <div className="grid grid-cols-5 gap-2 text-center text-xs text-bauhaus-gray">
                    {scores.map((score, i) => (
                      <div key={score.id}>
                        {formatRelativeDate(score.played_date)}
                      </div>
                    ))}
                  </div>
                  {!hasEnoughScores && (
                    <p className="text-center text-bauhaus-gray text-sm">
                      Add {5 - scores.length} more score(s) to enter the draw
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-bauhaus-gray mx-auto mb-4" />
                  <p className="text-bauhaus-gray mb-4">No scores yet. Add your first score!</p>
                  <Link href="/dashboard/scores">
                    <Button>Add Score</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Charity Card */}
        <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
          <Card hover={false}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Charity</CardTitle>
              <Link href="/dashboard/charity">
                <Button variant="ghost" size="sm">
                  Change <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {profile?.charity ? (
                <div className="space-y-4">
                  <div className="w-full h-32 bg-bauhaus-blue/10 rounded-lg overflow-hidden">
                    {profile.charity.image_url && (
                      <img 
                        src={profile.charity.image_url} 
                        alt={profile.charity.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h3 className="font-bold">{profile.charity.name}</h3>
                  <p className="text-sm text-bauhaus-gray line-clamp-2">
                    {profile.charity.description}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-bauhaus-black/10">
                    <span className="text-sm text-bauhaus-gray">Your contribution</span>
                    <Badge variant="success">{profile.charity_percentage}%</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-bauhaus-gray mx-auto mb-4" />
                  <p className="text-bauhaus-gray mb-4">No charity selected yet</p>
                  <Link href="/dashboard/charity">
                    <Button variant="secondary">Select Charity</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Latest Draw */}
        <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
          <Card hover={false}>
            <CardHeader>
              <CardTitle>Latest Draw Results</CardTitle>
            </CardHeader>
            <CardContent>
              {latestDraw ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-bauhaus-gray">{formatDate(latestDraw.draw_date)}</span>
                    <Badge variant="success">Published</Badge>
                  </div>
                  <div className="flex justify-center py-4">
                    <ScoreBallGroup scores={latestDraw.winning_numbers} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="text-bauhaus-gray">5-Match</p>
                      <p className="font-bold">{formatCurrency(latestDraw.five_match_pool)}</p>
                    </div>
                    <div>
                      <p className="text-bauhaus-gray">4-Match</p>
                      <p className="font-bold">{formatCurrency(latestDraw.four_match_pool)}</p>
                    </div>
                    <div>
                      <p className="text-bauhaus-gray">3-Match</p>
                      <p className="font-bold">{formatCurrency(latestDraw.three_match_pool)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-bauhaus-gray mx-auto mb-4" />
                  <p className="text-bauhaus-gray">No draws yet. Stay tuned!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Winnings */}
        <motion.div {...fadeInUp} transition={{ delay: 0.8 }}>
          <Card hover={false}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Winnings</CardTitle>
              <Link href="/dashboard/winnings">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {winnings.length > 0 ? (
                <div className="space-y-4">
                  {winnings.slice(0, 3).map((win) => (
                    <div
                      key={win.id}
                      className="flex items-center justify-between p-3 bg-bauhaus-black/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          win.match_type === 'five_match' ? 'bg-bauhaus-red' :
                          win.match_type === 'four_match' ? 'bg-bauhaus-blue' :
                          'bg-bauhaus-yellow'
                        } text-white`}>
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {win.match_type === 'five_match' ? '5-Match Jackpot!' :
                             win.match_type === 'four_match' ? '4-Match Winner' :
                             '3-Match Winner'}
                          </p>
                          <p className="text-xs text-bauhaus-gray">
                            {formatDate(win.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(win.prize_amount)}</p>
                        <Badge 
                          variant={win.payout_status === 'paid' ? 'success' : 'warning'} 
                          size="sm"
                        >
                          {win.payout_status === 'paid' ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Paid</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {pendingPayouts > 0 && (
                    <div className="p-3 bg-bauhaus-yellow/20 border border-bauhaus-yellow text-center">
                      <p className="text-sm">
                        <strong>{formatCurrency(pendingPayouts)}</strong> pending verification
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-bauhaus-gray mx-auto mb-4" />
                  <p className="text-bauhaus-gray">No winnings yet. Keep playing!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <motion.div {...fadeInUp} transition={{ delay: 0.9 }}>
          <Card hover={false} className="bg-bauhaus-black text-white">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-white/60 text-sm">Your Subscription</p>
                <p className="text-xl font-bold">
                  {subscription.plan_type === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
                </p>
                {subscription.current_period_end && (
                  <p className="text-sm text-white/60">
                    {subscription.cancel_at_period_end 
                      ? `Cancels on ${formatDate(subscription.current_period_end)}`
                      : `Renews on ${formatDate(subscription.current_period_end)}`
                    }
                  </p>
                )}
              </div>
              <Link href="/dashboard/settings">
                <Button variant="accent">Manage Subscription</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
