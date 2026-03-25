'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Upload, CheckCircle, Clock, XCircle, AlertCircle, FileImage } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, Input, toast } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Winner, Draw } from '@/types'

interface WinningsClientProps {
  winnings: (Winner & { draw: Draw })[]
  totalWon: number
  totalPaid: number
  pendingVerification: number
}

export function WinningsClient({ 
  winnings, 
  totalWon, 
  totalPaid, 
  pendingVerification 
}: WinningsClientProps) {
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)

  const handleUploadProof = async () => {
    if (!selectedWinner || !proofFile) return

    setIsUploading(true)

    try {
      const supabase = createClient()
      
      // Upload file to storage
      const fileExt = proofFile.name.split('.').pop()
      const fileName = `${selectedWinner.id}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(fileName, proofFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(fileName)

      // Update winner record
      const { error: updateError } = await supabase
        .from('winners')
        .update({ 
          proof_url: publicUrl,
          verification_status: 'pending'
        })
        .eq('id', selectedWinner.id)

      if (updateError) throw updateError

      toast.success('Proof uploaded!', 'Your proof has been submitted for review.')
      setSelectedWinner(null)
      setProofFile(null)
      
      // Refresh page
      window.location.reload()
    } catch (error: any) {
      toast.error('Upload failed', error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusBadge = (winner: Winner) => {
    if (winner.payout_status === 'paid') {
      return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>
    }
    if (winner.verification_status === 'rejected') {
      return <Badge variant="error"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
    }
    if (winner.verification_status === 'approved') {
      return <Badge variant="info"><Clock className="w-3 h-3 mr-1" /> Payment Pending</Badge>
    }
    if (winner.proof_url) {
      return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Under Review</Badge>
    }
    return <Badge variant="error"><AlertCircle className="w-3 h-3 mr-1" /> Proof Required</Badge>
  }

  const getMatchLabel = (matchType: string) => {
    switch (matchType) {
      case 'five_match': return '5-Number Jackpot'
      case 'four_match': return '4-Number Match'
      case 'three_match': return '3-Number Match'
      default: return matchType
    }
  }

  const getMatchColor = (matchType: string) => {
    switch (matchType) {
      case 'five_match': return 'bg-bauhaus-red'
      case 'four_match': return 'bg-bauhaus-blue'
      case 'three_match': return 'bg-bauhaus-yellow text-bauhaus-black'
      default: return 'bg-bauhaus-gray'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Winnings</h1>
        <p className="text-bauhaus-gray">
          View your prize history and upload proof to claim your winnings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="yellow" hover={false}>
          <CardContent className="text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-bauhaus-black" />
            <p className="text-sm text-bauhaus-black/60">Total Won</p>
            <p className="text-3xl font-bold">{formatCurrency(totalWon)}</p>
          </CardContent>
        </Card>

        <Card variant="blue" hover={false}>
          <CardContent className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-white" />
            <p className="text-sm text-white/60">Paid Out</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>

        <Card hover={false}>
          <CardContent className="text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-bauhaus-gray" />
            <p className="text-sm text-bauhaus-gray">Pending Verification</p>
            <p className="text-3xl font-bold">{formatCurrency(pendingVerification)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      {pendingVerification > 0 && (
        <div className="p-4 bg-bauhaus-yellow border-2 border-bauhaus-black">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Action Required</p>
              <p className="text-sm">
                You have winnings pending verification. Upload proof of your scores to claim your prizes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Winnings List */}
      <Card hover={false}>
        <CardHeader>
          <CardTitle>Prize History</CardTitle>
        </CardHeader>
        <CardContent>
          {winnings.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-bauhaus-gray mx-auto mb-4" />
              <p className="text-bauhaus-gray text-lg mb-2">No winnings yet</p>
              <p className="text-sm text-bauhaus-gray">
                Keep entering draws — your winning moment could be next!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {winnings.map((win, index) => (
                <motion.div
                  key={win.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 border-2 border-bauhaus-black/10"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getMatchColor(win.match_type)} text-white`}>
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold">{getMatchLabel(win.match_type)}</p>
                        <p className="text-sm text-bauhaus-gray">
                          Draw: {formatDate(win.draw?.draw_date || win.created_at)}
                        </p>
                        {win.matched_numbers.length > 0 && (
                          <p className="text-sm text-bauhaus-gray">
                            Matched: {win.matched_numbers.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(win.prize_amount)}</p>
                        {getStatusBadge(win)}
                      </div>

                      {!win.proof_url && win.verification_status !== 'approved' && win.payout_status !== 'paid' && (
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedWinner(win)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload Proof
                        </Button>
                      )}

                      {win.proof_url && win.verification_status === 'pending' && (
                        <a 
                          href={win.proof_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-bauhaus-blue hover:underline flex items-center gap-1"
                        >
                          <FileImage className="w-4 h-4" />
                          View Proof
                        </a>
                      )}
                    </div>
                  </div>

                  {win.verification_status === 'rejected' && win.admin_notes && (
                    <div className="mt-3 p-3 bg-bauhaus-red/10 border border-bauhaus-red">
                      <p className="text-sm text-bauhaus-red">
                        <strong>Rejection reason:</strong> {win.admin_notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={!!selectedWinner}
        onClose={() => {
          setSelectedWinner(null)
          setProofFile(null)
        }}
        title="Upload Proof of Scores"
      >
        <div className="space-y-4">
          <p className="text-bauhaus-gray">
            Upload a screenshot from your golf app showing the scores you entered. 
            Make sure the dates and scores are clearly visible.
          </p>

          <div className="border-2 border-dashed border-bauhaus-black/20 p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="hidden"
              id="proof-upload"
            />
            <label 
              htmlFor="proof-upload"
              className="cursor-pointer"
            >
              {proofFile ? (
                <div>
                  <FileImage className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="font-medium">{proofFile.name}</p>
                  <p className="text-sm text-bauhaus-gray">Click to change</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto mb-2 text-bauhaus-gray" />
                  <p className="font-medium">Click to upload</p>
                  <p className="text-sm text-bauhaus-gray">PNG, JPG up to 5MB</p>
                </div>
              )}
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUploadProof}
              disabled={!proofFile}
              isLoading={isUploading}
              className="flex-1"
            >
              Submit Proof
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedWinner(null)
                setProofFile(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
