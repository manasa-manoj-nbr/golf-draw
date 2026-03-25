'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Eye,
  Image as ImageIcon,
  AlertTriangle,
  Send,
  Trophy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Winner } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface VerificationClientProps {
  winners: Winner[]
  stats: {
    pending: number
    approved: number
    rejected: number
    pendingPayout: number
    totalPrizeAmount: number
    pendingPayoutAmount: number
  }
}

export function VerificationClient({ winners, stats }: VerificationClientProps) {
  const router = useRouter()
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [adminNotes, setAdminNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredWinners = winners.filter(w => {
    if (filter === 'all') return true
    return w.verification_status === filter
  })

  const handleVerification = async (winnerId: string, status: 'approved' | 'rejected') => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/verification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winner_id: winnerId,
          verification_status: status,
          admin_notes: adminNotes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update verification')
      }

      setSelectedWinner(null)
      setAdminNotes('')
      router.refresh()
    } catch (error) {
      console.error('Error updating verification:', error)
      alert('Failed to update verification. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkPaid = async (winnerId: string) => {
    try {
      const response = await fetch('/api/admin/verification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winner_id: winnerId,
          payout_status: 'paid',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark as paid')
      }

      router.refresh()
    } catch (error) {
      console.error('Error marking as paid:', error)
      alert('Failed to mark as paid. Please try again.')
    }
  }

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'five_match': return 'bg-bauhaus-yellow text-bauhaus-black'
      case 'four_match': return 'bg-bauhaus-blue text-white'
      case 'three_match': return 'bg-bauhaus-red text-white'
      default: return 'bg-bauhaus-gray text-white'
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-bauhaus-black">
          Winner Verification
        </h1>
        <p className="mt-2 text-bauhaus-gray">
          Review and verify winner proof for prize payouts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn(stats.pending > 0 && 'ring-2 ring-bauhaus-yellow')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-yellow flex items-center justify-center">
                <Clock className="w-6 h-6 text-bauhaus-black" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-green flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-red flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bauhaus-blue flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-bauhaus-gray">Pending Payout</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.pendingPayoutAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 font-medium transition-colors border-2 capitalize',
                  filter === f
                    ? 'bg-bauhaus-black text-white border-bauhaus-black'
                    : 'bg-white text-bauhaus-black border-bauhaus-black/20 hover:border-bauhaus-black'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Winners List */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredWinners.length === 0 ? (
            <div className="p-12 text-center text-bauhaus-gray">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No winners to review in this category</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-bauhaus-black/10">
              {filteredWinners.map((winner, index) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-bauhaus-black/5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Match Type Badge */}
                      <div className={cn(
                        'w-16 h-16 flex flex-col items-center justify-center',
                        getMatchTypeColor(winner.match_type)
                      )}>
                        <Trophy className="w-5 h-5" />
                        <span className="text-xs font-bold mt-1">
                          {winner.match_type.split('_')[0]}
                        </span>
                      </div>

                      {/* User Info */}
                      <div>
                        <p className="font-bold text-lg">
                          {winner.user?.full_name || winner.user?.email || 'Unknown User'}
                        </p>
                        <p className="text-sm text-bauhaus-gray">
                          {winner.user?.email}
                        </p>
                        <p className="text-sm text-bauhaus-gray mt-1">
                          Draw: {winner.draw ? formatDate(winner.draw.draw_date) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Matched Numbers & Prize */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-1">
                        {winner.matched_numbers?.map((num, i) => (
                          <span
                            key={i}
                            className="w-8 h-8 bg-bauhaus-yellow text-bauhaus-black text-sm font-bold flex items-center justify-center"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                      <p className="text-2xl font-bold text-bauhaus-black">
                        {formatCurrency(winner.prize_amount)}
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-3 py-1 text-xs font-bold',
                          winner.verification_status === 'approved' ? 'bg-bauhaus-green text-white' :
                          winner.verification_status === 'rejected' ? 'bg-bauhaus-red text-white' :
                          'bg-bauhaus-yellow text-bauhaus-black'
                        )}>
                          {winner.verification_status.toUpperCase()}
                        </span>
                        {winner.verification_status === 'approved' && (
                          <span className={cn(
                            'px-3 py-1 text-xs font-bold',
                            winner.payout_status === 'paid' 
                              ? 'bg-bauhaus-blue text-white' 
                              : 'bg-bauhaus-gray/20 text-bauhaus-gray'
                          )}>
                            {winner.payout_status === 'paid' ? 'PAID' : 'UNPAID'}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {/* Proof indicator */}
                        {winner.proof_url ? (
                          <button
                            onClick={() => setSelectedWinner(winner)}
                            className="flex items-center gap-1 px-3 py-1 border-2 border-bauhaus-green text-bauhaus-green hover:bg-bauhaus-green hover:text-white transition-colors"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">View Proof</span>
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 px-3 py-1 border-2 border-bauhaus-gray/30 text-bauhaus-gray">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm">No Proof</span>
                          </span>
                        )}

                        {/* Review button for pending */}
                        {winner.verification_status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedWinner(winner)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        )}

                        {/* Mark as paid button */}
                        {winner.verification_status === 'approved' && winner.payout_status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPaid(winner.id)}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedWinner}
        onClose={() => {
          setSelectedWinner(null)
          setAdminNotes('')
        }}
        title="Review Winner Verification"
        size="lg"
      >
        {selectedWinner && (
          <div className="space-y-6">
            {/* Winner Info */}
            <div className="flex items-center gap-4 p-4 bg-bauhaus-black/5">
              <div className={cn(
                'w-16 h-16 flex flex-col items-center justify-center',
                getMatchTypeColor(selectedWinner.match_type)
              )}>
                <Trophy className="w-6 h-6" />
                <span className="text-xs font-bold mt-1">
                  {selectedWinner.match_type.split('_')[0]}
                </span>
              </div>
              <div>
                <p className="font-bold text-lg">
                  {selectedWinner.user?.full_name || selectedWinner.user?.email}
                </p>
                <p className="text-bauhaus-gray">{selectedWinner.user?.email}</p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(selectedWinner.prize_amount)}
                </p>
              </div>
            </div>

            {/* Matched Numbers */}
            <div>
              <p className="font-bold mb-2">Matched Numbers</p>
              <div className="flex gap-2">
                {selectedWinner.matched_numbers?.map((num, i) => (
                  <span
                    key={i}
                    className="w-10 h-10 bg-bauhaus-yellow text-bauhaus-black font-bold flex items-center justify-center"
                  >
                    {num}
                  </span>
                ))}
              </div>
              {selectedWinner.draw?.winning_numbers && (
                <div className="mt-2">
                  <p className="text-sm text-bauhaus-gray mb-1">Draw winning numbers:</p>
                  <div className="flex gap-1">
                    {selectedWinner.draw.winning_numbers.map((num, i) => (
                      <span
                        key={i}
                        className={cn(
                          'w-8 h-8 text-sm font-bold flex items-center justify-center',
                          selectedWinner.matched_numbers?.includes(num)
                            ? 'bg-bauhaus-green text-white'
                            : 'bg-bauhaus-gray/20 text-bauhaus-gray'
                        )}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Proof Image */}
            <div>
              <p className="font-bold mb-2">Proof Screenshot</p>
              {selectedWinner.proof_url ? (
                <div className="border-2 border-bauhaus-black/20">
                  <img
                    src={selectedWinner.proof_url}
                    alt="Winner proof"
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-bauhaus-gray/30 text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto text-bauhaus-gray/50 mb-2" />
                  <p className="text-bauhaus-gray">No proof uploaded yet</p>
                </div>
              )}
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block font-bold mb-2">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this verification..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-bauhaus-black/20 focus:border-bauhaus-black focus:outline-none transition-colors"
              />
            </div>

            {/* Actions */}
            {selectedWinner.verification_status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t-2 border-bauhaus-black/10">
                <Button
                  variant="outline"
                  className="flex-1 border-bauhaus-red text-bauhaus-red hover:bg-bauhaus-red hover:text-white"
                  onClick={() => handleVerification(selectedWinner.id, 'rejected')}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-bauhaus-green hover:bg-bauhaus-green/90"
                  onClick={() => handleVerification(selectedWinner.id, 'approved')}
                  disabled={isSubmitting || !selectedWinner.proof_url}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}

            {selectedWinner.verification_status !== 'pending' && (
              <div className="p-4 bg-bauhaus-black/5">
                <p className="text-sm text-bauhaus-gray">
                  This winner has already been{' '}
                  <span className={cn(
                    'font-bold',
                    selectedWinner.verification_status === 'approved' 
                      ? 'text-bauhaus-green' 
                      : 'text-bauhaus-red'
                  )}>
                    {selectedWinner.verification_status}
                  </span>
                </p>
                {selectedWinner.admin_notes && (
                  <p className="mt-2 text-sm">
                    <span className="font-bold">Notes:</span> {selectedWinner.admin_notes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
