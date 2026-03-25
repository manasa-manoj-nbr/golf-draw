'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Play, 
  Calendar,
  DollarSign,
  Users,
  RefreshCw,
  Eye,
  Settings,
  Zap,
  Shuffle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Draw, PrizePool, PRIZE_DISTRIBUTION } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DrawWithWinners extends Draw {
  winner_count: number
}

interface DrawsClientProps {
  draws: DrawWithWinners[]
  prizePool: PrizePool | null
  activeSubscribers: number
}

export function DrawsClient({ draws, prizePool, activeSubscribers }: DrawsClientProps) {
  const router = useRouter()
  const [showRunDrawModal, setShowRunDrawModal] = useState(false)
  const [showSimulationModal, setShowSimulationModal] = useState(false)
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [isRunning, setIsRunning] = useState(false)
  const [simulationResult, setSimulationResult] = useState<{
    numbers: number[]
    potentialWinners: { type: string; count: number }[]
  } | null>(null)

  const totalPrizePool = prizePool?.total_amount || 0
  const rollover = prizePool?.rollover_amount || 0

  const handleRunDraw = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/admin/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          draw_type: drawType,
          action: 'execute'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to run draw')
      }

      setShowRunDrawModal(false)
      router.refresh()
    } catch (error) {
      console.error('Error running draw:', error)
      alert('Failed to run draw. Please try again.')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSimulate = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/admin/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          draw_type: drawType,
          action: 'simulate'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to simulate draw')
      }

      const result = await response.json()
      setSimulationResult(result.data)
      setShowSimulationModal(true)
    } catch (error) {
      console.error('Error simulating draw:', error)
      alert('Failed to simulate draw. Please try again.')
    } finally {
      setIsRunning(false)
    }
  }

  const handlePublishDraw = async (drawId: string) => {
    try {
      const response = await fetch('/api/admin/draws', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          draw_id: drawId,
          action: 'publish'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish draw')
      }

      router.refresh()
    } catch (error) {
      console.error('Error publishing draw:', error)
      alert('Failed to publish draw. Please try again.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-bauhaus-black">
            Draw Management
          </h1>
          <p className="mt-2 text-bauhaus-gray">
            Configure and execute monthly prize draws
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleSimulate}
            disabled={isRunning}
          >
            <Eye className="w-4 h-4 mr-2" />
            Simulate
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowRunDrawModal(true)}
          >
            <Play className="w-4 h-4 mr-2" />
            Run Draw
          </Button>
        </div>
      </div>

      {/* Prize Pool Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-yellow flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-bauhaus-black" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Total Prize Pool</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPrizePool)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-red flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">5-Match Jackpot</p>
                <p className="text-2xl font-bold">
                  {formatCurrency((totalPrizePool * PRIZE_DISTRIBUTION.five_match) + rollover)}
                </p>
                {rollover > 0 && (
                  <p className="text-xs text-bauhaus-green">+{formatCurrency(rollover)} rollover</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-blue flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Rollover Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(rollover)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-green flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Active Subscribers</p>
                <p className="text-2xl font-bold">{activeSubscribers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prize Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Prize Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 border-2 border-bauhaus-yellow bg-bauhaus-yellow/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-bauhaus-yellow flex items-center justify-center">
                  <span className="font-bold">5</span>
                </div>
                <div>
                  <p className="font-bold">5-Match Jackpot</p>
                  <p className="text-sm text-bauhaus-gray">40% of pool + rollover</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-bauhaus-black">
                {formatCurrency((totalPrizePool * PRIZE_DISTRIBUTION.five_match) + rollover)}
              </p>
              <p className="text-sm text-bauhaus-gray mt-1">Rolls over if unclaimed</p>
            </div>
            <div className="p-6 border-2 border-bauhaus-blue bg-bauhaus-blue/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-bauhaus-blue text-white flex items-center justify-center">
                  <span className="font-bold">4</span>
                </div>
                <div>
                  <p className="font-bold">4-Match Prize</p>
                  <p className="text-sm text-bauhaus-gray">35% of pool</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-bauhaus-black">
                {formatCurrency(totalPrizePool * PRIZE_DISTRIBUTION.four_match)}
              </p>
              <p className="text-sm text-bauhaus-gray mt-1">Split among winners</p>
            </div>
            <div className="p-6 border-2 border-bauhaus-red bg-bauhaus-red/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-bauhaus-red text-white flex items-center justify-center">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <p className="font-bold">3-Match Prize</p>
                  <p className="text-sm text-bauhaus-gray">25% of pool</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-bauhaus-black">
                {formatCurrency(totalPrizePool * PRIZE_DISTRIBUTION.three_match)}
              </p>
              <p className="text-sm text-bauhaus-gray mt-1">Split among winners</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Draw History */}
      <Card>
        <CardHeader>
          <CardTitle>Draw History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bauhaus-black text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Date</th>
                  <th className="px-6 py-4 text-left font-bold">Winning Numbers</th>
                  <th className="px-6 py-4 text-left font-bold">Type</th>
                  <th className="px-6 py-4 text-left font-bold">Pool Amount</th>
                  <th className="px-6 py-4 text-left font-bold">Winners</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-bauhaus-black/10">
                {draws.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-bauhaus-gray">
                      No draws yet. Run your first draw to get started.
                    </td>
                  </tr>
                ) : (
                  draws.map((draw, index) => (
                    <motion.tr
                      key={draw.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-bauhaus-black/5"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-bauhaus-gray" />
                          <span className="font-medium">{formatDate(draw.draw_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {draw.winning_numbers?.map((num, i) => (
                            <span
                              key={i}
                              className="w-8 h-8 bg-bauhaus-yellow text-bauhaus-black font-bold flex items-center justify-center"
                            >
                              {num}
                            </span>
                          )) || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2 py-1 text-xs font-bold',
                          draw.draw_type === 'random' 
                            ? 'bg-bauhaus-blue/20 text-bauhaus-blue' 
                            : 'bg-bauhaus-yellow/20 text-bauhaus-black'
                        )}>
                          {draw.draw_type === 'random' ? (
                            <><Shuffle className="w-3 h-3 inline mr-1" /> Random</>
                          ) : (
                            <><Zap className="w-3 h-3 inline mr-1" /> Algorithmic</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(draw.total_pool_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2 py-1 text-sm font-bold',
                          draw.winner_count > 0 ? 'text-bauhaus-green' : 'text-bauhaus-gray'
                        )}>
                          {draw.winner_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-3 py-1 text-xs font-bold',
                          draw.status === 'published' ? 'bg-bauhaus-green text-white' :
                          draw.status === 'completed' ? 'bg-bauhaus-blue text-white' :
                          'bg-bauhaus-gray/20 text-bauhaus-gray'
                        )}>
                          {draw.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {draw.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublishDraw(draw.id)}
                          >
                            Publish
                          </Button>
                        )}
                        {draw.status === 'published' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/draws/${draw.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Run Draw Modal */}
      <Modal
        isOpen={showRunDrawModal}
        onClose={() => setShowRunDrawModal(false)}
        title="Run New Draw"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-bauhaus-yellow/20 border-2 border-bauhaus-yellow">
            <p className="font-medium text-bauhaus-black">
              You are about to run a new draw with the following pool:
            </p>
            <p className="text-2xl font-bold mt-2">{formatCurrency(totalPrizePool + rollover)}</p>
            <p className="text-sm text-bauhaus-gray mt-1">
              Base pool: {formatCurrency(totalPrizePool)} + Rollover: {formatCurrency(rollover)}
            </p>
          </div>

          <div>
            <label className="block font-bold mb-3">Draw Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDrawType('random')}
                className={cn(
                  'p-4 border-2 text-left transition-colors',
                  drawType === 'random' 
                    ? 'border-bauhaus-blue bg-bauhaus-blue/10' 
                    : 'border-bauhaus-black/20 hover:border-bauhaus-black'
                )}
              >
                <Shuffle className="w-6 h-6 mb-2" />
                <p className="font-bold">Random</p>
                <p className="text-sm text-bauhaus-gray">
                  5 truly random numbers (1-45)
                </p>
              </button>
              <button
                onClick={() => setDrawType('algorithmic')}
                className={cn(
                  'p-4 border-2 text-left transition-colors',
                  drawType === 'algorithmic' 
                    ? 'border-bauhaus-yellow bg-bauhaus-yellow/10' 
                    : 'border-bauhaus-black/20 hover:border-bauhaus-black'
                )}
              >
                <Zap className="w-6 h-6 mb-2" />
                <p className="font-bold">Algorithmic</p>
                <p className="text-sm text-bauhaus-gray">
                  Based on user score distribution
                </p>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-bauhaus-black/10">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowRunDrawModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="flex-1"
              onClick={handleRunDraw}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Draw'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Simulation Result Modal */}
      <Modal
        isOpen={showSimulationModal}
        onClose={() => setShowSimulationModal(false)}
        title="Simulation Result"
        size="md"
      >
        {simulationResult && (
          <div className="space-y-6">
            <div>
              <p className="font-bold mb-3">Simulated Winning Numbers</p>
              <div className="flex gap-2 justify-center">
                {simulationResult.numbers.map((num, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-bauhaus-yellow text-bauhaus-black text-xl font-bold flex items-center justify-center"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-bold mb-3">Potential Winners</p>
              <div className="space-y-2">
                {simulationResult.potentialWinners.map((w) => (
                  <div 
                    key={w.type}
                    className="flex justify-between items-center p-3 border-2 border-bauhaus-black/10"
                  >
                    <span className="font-medium capitalize">
                      {w.type.replace('_', ' ')}
                    </span>
                    <span className="font-bold">{w.count} users</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-bauhaus-gray text-center">
              This is a simulation only. No draw has been executed.
            </p>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowSimulationModal(false)}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
