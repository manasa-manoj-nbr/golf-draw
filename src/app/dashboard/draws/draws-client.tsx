'use client'

import { motion } from 'framer-motion'
import { Trophy, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge, ScoreBallGroup } from '@/components/ui'
import { formatCurrency, formatDate, daysUntilDraw, countMatchingNumbers, getMatchType } from '@/lib/utils'
import type { Draw } from '@/types'

interface DrawsClientProps {
  draws: Draw[]
  userScores: number[]
  userWinnings: { draw_id: string; match_type: string; prize_amount: number }[]
}

export function DrawsClient({ draws, userScores, userWinnings }: DrawsClientProps) {
  const daysLeft = daysUntilDraw()
  const hasEnoughScores = userScores.length >= 5

  const getWinningForDraw = (drawId: string) => {
    return userWinnings.find(w => w.draw_id === drawId)
  }

  const checkMatches = (winningNumbers: number[]) => {
    if (!hasEnoughScores) return { count: 0, matched: [] }
    const matched = userScores.filter(s => winningNumbers.includes(s))
    return { count: matched.length, matched }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Draw History</h1>
        <p className="text-bauhaus-gray">
          View past draw results and see how your scores matched up.
        </p>
      </div>

      {/* Next Draw Countdown */}
      <Card variant="red" hover={false}>
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Next Draw In</p>
              <p className="text-3xl font-bold text-white">{daysLeft} Days</p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-white/80 text-sm mb-2">Your Current Numbers</p>
            {hasEnoughScores ? (
              <div className="flex gap-2 justify-center md:justify-end">
                {userScores.map((score, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-white text-bauhaus-black rounded-full flex items-center justify-center font-bold"
                  >
                    {score}
                  </div>
                ))}
              </div>
            ) : (
              <Badge variant="warning">Need {5 - userScores.length} more scores</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Draw History */}
      <Card hover={false}>
        <CardHeader>
          <CardTitle>Past Draws</CardTitle>
        </CardHeader>
        <CardContent>
          {draws.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-bauhaus-gray mx-auto mb-4" />
              <p className="text-bauhaus-gray">No draws have been published yet. Stay tuned!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {draws.map((draw, index) => {
                const winning = getWinningForDraw(draw.id)
                const matches = checkMatches(draw.winning_numbers)
                const matchType = getMatchType(matches.count)
                
                return (
                  <motion.div
                    key={draw.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 border-2 ${
                      winning ? 'border-green-500 bg-green-50' : 'border-bauhaus-black/10'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-bauhaus-gray" />
                          <span className="font-bold">{formatDate(draw.draw_date)}</span>
                        </div>
                        {winning && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Winner!
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-bauhaus-gray">5-Match:</span>{' '}
                          <span className="font-bold">{formatCurrency(draw.five_match_pool)}</span>
                        </div>
                        <div>
                          <span className="text-bauhaus-gray">4-Match:</span>{' '}
                          <span className="font-bold">{formatCurrency(draw.four_match_pool)}</span>
                        </div>
                        <div>
                          <span className="text-bauhaus-gray">3-Match:</span>{' '}
                          <span className="font-bold">{formatCurrency(draw.three_match_pool)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Winning Numbers */}
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div>
                        <p className="text-sm text-bauhaus-gray mb-2 text-center md:text-left">Winning Numbers</p>
                        <ScoreBallGroup scores={draw.winning_numbers} />
                      </div>

                      {hasEnoughScores && (
                        <>
                          <div className="hidden md:block w-px h-16 bg-bauhaus-black/10" />
                          
                          <div>
                            <p className="text-sm text-bauhaus-gray mb-2 text-center md:text-left">Your Match</p>
                            <div className="flex items-center gap-4">
                              <div className="flex gap-2">
                                {userScores.map((score, i) => {
                                  const isMatch = draw.winning_numbers.includes(score)
                                  return (
                                    <div
                                      key={i}
                                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                                        isMatch
                                          ? 'bg-green-500 text-white border-green-600'
                                          : 'bg-bauhaus-light-gray text-bauhaus-gray border-bauhaus-gray/20'
                                      }`}
                                    >
                                      {score}
                                    </div>
                                  )
                                })}
                              </div>
                              
                              <Badge variant={matches.count >= 3 ? 'success' : 'default'}>
                                {matches.count} match{matches.count !== 1 ? 'es' : ''}
                              </Badge>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Winning Details */}
                    {winning && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-green-700 font-medium">
                              {winning.match_type === 'five_match' ? '5-Number Jackpot!' :
                               winning.match_type === 'four_match' ? '4-Number Match' :
                               '3-Number Match'}
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            +{formatCurrency(winning.prize_amount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Draw Info */}
      <Card hover={false} className="bg-bauhaus-black text-white">
        <CardContent>
          <h3 className="font-bold text-lg mb-4">How Draws Work</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-bauhaus-yellow font-bold mb-2">5-Number Match (40%)</p>
              <p className="text-sm text-white/70">
                Match all 5 numbers to win the jackpot. Rolls over if unclaimed.
              </p>
            </div>
            <div>
              <p className="text-bauhaus-blue font-bold mb-2">4-Number Match (35%)</p>
              <p className="text-sm text-white/70">
                Match 4 numbers for a substantial prize. Split among all winners.
              </p>
            </div>
            <div>
              <p className="text-bauhaus-red font-bold mb-2">3-Number Match (25%)</p>
              <p className="text-sm text-white/70">
                Match 3 numbers to win. More chances to share in the prize pool.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
