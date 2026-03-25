'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit2, Save, X, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, ScoreBall, toast } from '@/components/ui'
import { formatDate, formatRelativeDate, validateScore } from '@/lib/utils'
import type { Score } from '@/types'

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newScore, setNewScore] = useState({ score: '', played_date: '' })
  const [editScore, setEditScore] = useState({ score: '', played_date: '' })

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores')
      const data = await res.json()
      if (data.scores) {
        setScores(data.scores)
      }
    } catch (error) {
      toast.error('Failed to load scores')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddScore = async () => {
    const scoreNum = parseInt(newScore.score)
    
    if (!validateScore(scoreNum)) {
      toast.error('Invalid score', 'Score must be between 1 and 45')
      return
    }

    if (!newScore.played_date) {
      toast.error('Date required', 'Please enter the date you played')
      return
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: scoreNum,
          played_date: newScore.played_date,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setScores(data.scores)
      setNewScore({ score: '', played_date: '' })
      setIsAdding(false)
      toast.success('Score added!', 'Your score has been recorded')
    } catch (error: any) {
      toast.error('Failed to add score', error.message)
    }
  }

  const handleUpdateScore = async (id: string) => {
    const scoreNum = parseInt(editScore.score)
    
    if (!validateScore(scoreNum)) {
      toast.error('Invalid score', 'Score must be between 1 and 45')
      return
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          score: scoreNum,
          played_date: editScore.played_date,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setScores(scores.map(s => s.id === id ? data.score : s))
      setEditingId(null)
      toast.success('Score updated!')
    } catch (error: any) {
      toast.error('Failed to update score', error.message)
    }
  }

  const handleDeleteScore = async (id: string) => {
    if (!confirm('Are you sure you want to delete this score?')) return

    try {
      const res = await fetch(`/api/scores?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setScores(scores.filter(s => s.id !== id))
      toast.success('Score deleted')
    } catch (error: any) {
      toast.error('Failed to delete score', error.message)
    }
  }

  const startEditing = (score: Score) => {
    setEditingId(score.id)
    setEditScore({
      score: score.score.toString(),
      played_date: score.played_date,
    })
  }

  const colors: ('red' | 'blue' | 'yellow')[] = ['red', 'blue', 'yellow', 'red', 'blue']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-bauhaus-red border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Scores</h1>
          <p className="text-bauhaus-gray">
            Enter your latest Stableford golf scores (1-45). Only your last 5 scores count.
          </p>
        </div>
        {scores.length < 5 && !isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Score
          </Button>
        )}
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-bauhaus-blue/10 border-2 border-bauhaus-blue">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-bauhaus-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-bauhaus-blue">How Scores Work</p>
            <p className="text-sm text-bauhaus-gray">
              You need 5 scores to enter the monthly draw. When you add a 6th score, the oldest one is automatically removed.
              Scores must be in Stableford format (1-45 points).
            </p>
          </div>
        </div>
      </div>

      {/* Score Preview */}
      {scores.length > 0 && (
        <Card hover={false}>
          <CardHeader>
            <CardTitle>Your Draw Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 flex-wrap">
              {scores.map((score, index) => (
                <motion.div
                  key={score.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ScoreBall score={score.score} color={colors[index % 5]} size="lg" />
                </motion.div>
              ))}
              {Array.from({ length: 5 - scores.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-bauhaus-gray/30 flex items-center justify-center text-bauhaus-gray"
                >
                  ?
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <Badge variant={scores.length === 5 ? 'success' : 'warning'}>
                {scores.length}/5 scores entered
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Score Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card hover={false}>
            <CardHeader>
              <CardTitle>Add New Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Stableford Score"
                  type="number"
                  min="1"
                  max="45"
                  placeholder="Enter score (1-45)"
                  value={newScore.score}
                  onChange={(e) => setNewScore({ ...newScore, score: e.target.value })}
                />
                <Input
                  label="Date Played"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={newScore.played_date}
                  onChange={(e) => setNewScore({ ...newScore, played_date: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddScore}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Score
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Scores List */}
      <Card hover={false}>
        <CardHeader>
          <CardTitle>Score History</CardTitle>
        </CardHeader>
        <CardContent>
          {scores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-bauhaus-gray mb-4">No scores yet. Add your first score to get started!</p>
              {!isAdding && (
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Score
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {scores.map((score, index) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-bauhaus-black/5"
                >
                  {editingId === score.id ? (
                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Input
                        type="number"
                        min="1"
                        max="45"
                        value={editScore.score}
                        onChange={(e) => setEditScore({ ...editScore, score: e.target.value })}
                        className="w-24"
                      />
                      <Input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={editScore.played_date}
                        onChange={(e) => setEditScore({ ...editScore, played_date: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdateScore(score.id)}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <ScoreBall score={score.score} color={colors[index % 5]} size="md" />
                        <div>
                          <p className="font-bold">{score.score} points</p>
                          <p className="text-sm text-bauhaus-gray">
                            Played on {formatDate(score.played_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge size="sm">{formatRelativeDate(score.played_date)}</Badge>
                        <button
                          onClick={() => startEditing(score)}
                          className="p-2 hover:bg-bauhaus-black/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-bauhaus-gray" />
                        </button>
                        <button
                          onClick={() => handleDeleteScore(score.id)}
                          className="p-2 hover:bg-bauhaus-red/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-bauhaus-red" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
