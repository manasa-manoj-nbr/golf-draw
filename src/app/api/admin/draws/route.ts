import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRIZE_DISTRIBUTION } from '@/types'

// Generate random numbers between 1-45
function generateRandomNumbers(): number[] {
  const numbers: number[] = []
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }
  return numbers.sort((a, b) => a - b)
}

// Generate algorithmic numbers based on score distribution
async function generateAlgorithmicNumbers(supabase: any): Promise<number[]> {
  // Get all active users' scores
  const { data: scores } = await supabase
    .from('scores')
    .select('score, user_id')

  if (!scores || scores.length === 0) {
    return generateRandomNumbers()
  }

  // Calculate score frequency
  const scoreFrequency: { [key: number]: number } = {}
  scores.forEach((s: { score: number }) => {
    scoreFrequency[s.score] = (scoreFrequency[s.score] || 0) + 1
  })

  // Weight selection towards more common scores
  const weightedPool: number[] = []
  Object.entries(scoreFrequency).forEach(([score, freq]) => {
    for (let i = 0; i < freq; i++) {
      weightedPool.push(parseInt(score))
    }
  })

  // Select 5 unique numbers from weighted pool
  const numbers: number[] = []
  while (numbers.length < 5 && weightedPool.length > 0) {
    const idx = Math.floor(Math.random() * weightedPool.length)
    const num = weightedPool[idx]
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
    // Remove all instances of this number
    for (let i = weightedPool.length - 1; i >= 0; i--) {
      if (weightedPool[i] === num) {
        weightedPool.splice(i, 1)
      }
    }
  }

  // Fill remaining with random if needed
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }

  return numbers.sort((a, b) => a - b)
}

// Find matches between user scores and winning numbers
function findMatches(userScores: number[], winningNumbers: number[]): number[] {
  return userScores.filter(score => winningNumbers.includes(score))
}

// POST - Run or simulate a draw
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { draw_type, action } = body

    // Generate winning numbers
    const winningNumbers = draw_type === 'algorithmic' 
      ? await generateAlgorithmicNumbers(supabase)
      : generateRandomNumbers()

    // For simulation, calculate potential winners without creating records
    if (action === 'simulate') {
      // Get all active subscribers with their scores
      const { data: activeUsers } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active')

      if (!activeUsers) {
        return NextResponse.json({
          data: {
            numbers: winningNumbers,
            potentialWinners: [
              { type: 'five_match', count: 0 },
              { type: 'four_match', count: 0 },
              { type: 'three_match', count: 0 },
            ]
          }
        })
      }

      const userIds = activeUsers.map(u => u.user_id)
      
      // Get scores for active users
      const { data: allScores } = await supabase
        .from('scores')
        .select('user_id, score')
        .in('user_id', userIds)

      // Group scores by user and get their latest 5
      const userScores: { [key: string]: number[] } = {}
      allScores?.forEach((s: { user_id: string; score: number }) => {
        if (!userScores[s.user_id]) {
          userScores[s.user_id] = []
        }
        if (userScores[s.user_id].length < 5) {
          userScores[s.user_id].push(s.score)
        }
      })

      // Calculate matches
      const potentialWinners = {
        five_match: 0,
        four_match: 0,
        three_match: 0,
      }

      Object.entries(userScores).forEach(([, scores]) => {
        const matches = findMatches(scores, winningNumbers)
        if (matches.length >= 5) potentialWinners.five_match++
        else if (matches.length === 4) potentialWinners.four_match++
        else if (matches.length === 3) potentialWinners.three_match++
      })

      return NextResponse.json({
        data: {
          numbers: winningNumbers,
          potentialWinners: [
            { type: 'five_match', count: potentialWinners.five_match },
            { type: 'four_match', count: potentialWinners.four_match },
            { type: 'three_match', count: potentialWinners.three_match },
          ]
        }
      })
    }

    // For execution, create draw and find winners
    if (action === 'execute') {
      // Get current prize pool
      const { data: prizePool } = await supabase
        .from('prize_pools')
        .select('*')
        .order('month', { ascending: false })
        .limit(1)
        .single()

      const totalPool = prizePool?.total_amount || 0
      const rollover = prizePool?.rollover_amount || 0

      const fiveMatchPool = (totalPool * PRIZE_DISTRIBUTION.five_match) + rollover
      const fourMatchPool = totalPool * PRIZE_DISTRIBUTION.four_match
      const threeMatchPool = totalPool * PRIZE_DISTRIBUTION.three_match

      // Create draw record
      const { data: draw, error: drawError } = await supabase
        .from('draws')
        .insert({
          draw_date: new Date().toISOString(),
          winning_numbers: winningNumbers,
          draw_type,
          status: 'completed',
          total_pool_amount: totalPool,
          jackpot_amount: fiveMatchPool,
          five_match_pool: fiveMatchPool,
          four_match_pool: fourMatchPool,
          three_match_pool: threeMatchPool,
          rollover_amount: rollover,
        })
        .select()
        .single()

      if (drawError) {
        throw drawError
      }

      // Get all active subscribers with their scores
      const { data: activeUsers } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active')

      if (activeUsers && activeUsers.length > 0) {
        const userIds = activeUsers.map(u => u.user_id)
        
        // Get scores for active users
        const { data: allScores } = await supabase
          .from('scores')
          .select('user_id, score')
          .in('user_id', userIds)
          .order('played_date', { ascending: false })

        // Group scores by user and get their latest 5
        const userScores: { [key: string]: number[] } = {}
        allScores?.forEach((s: { user_id: string; score: number }) => {
          if (!userScores[s.user_id]) {
            userScores[s.user_id] = []
          }
          if (userScores[s.user_id].length < 5) {
            userScores[s.user_id].push(s.score)
          }
        })

        // Find winners and create records
        const winners: { 
          user_id: string; 
          match_type: string; 
          matched_numbers: number[]; 
          prize_amount: number 
        }[] = []

        Object.entries(userScores).forEach(([userId, scores]) => {
          const matches = findMatches(scores, winningNumbers)
          if (matches.length >= 5) {
            winners.push({
              user_id: userId,
              match_type: 'five_match',
              matched_numbers: matches.slice(0, 5),
              prize_amount: 0, // Will be calculated
            })
          } else if (matches.length === 4) {
            winners.push({
              user_id: userId,
              match_type: 'four_match',
              matched_numbers: matches,
              prize_amount: 0,
            })
          } else if (matches.length === 3) {
            winners.push({
              user_id: userId,
              match_type: 'three_match',
              matched_numbers: matches,
              prize_amount: 0,
            })
          }
        })

        // Calculate prize amounts
        const fiveMatchWinners = winners.filter(w => w.match_type === 'five_match')
        const fourMatchWinners = winners.filter(w => w.match_type === 'four_match')
        const threeMatchWinners = winners.filter(w => w.match_type === 'three_match')

        // 5-match jackpot (split if multiple winners)
        if (fiveMatchWinners.length > 0) {
          const prizePerWinner = fiveMatchPool / fiveMatchWinners.length
          fiveMatchWinners.forEach(w => w.prize_amount = prizePerWinner)
        }

        // 4-match (split among winners)
        if (fourMatchWinners.length > 0) {
          const prizePerWinner = fourMatchPool / fourMatchWinners.length
          fourMatchWinners.forEach(w => w.prize_amount = prizePerWinner)
        }

        // 3-match (split among winners)
        if (threeMatchWinners.length > 0) {
          const prizePerWinner = threeMatchPool / threeMatchWinners.length
          threeMatchWinners.forEach(w => w.prize_amount = prizePerWinner)
        }

        // Insert winner records
        if (winners.length > 0) {
          const winnerRecords = winners.map(w => ({
            draw_id: draw.id,
            user_id: w.user_id,
            match_type: w.match_type,
            matched_numbers: w.matched_numbers,
            prize_amount: w.prize_amount,
            verification_status: 'pending',
            payout_status: 'pending',
          }))

          await supabase.from('winners').insert(winnerRecords)
        }

        // Update rollover if no 5-match winner
        if (fiveMatchWinners.length === 0) {
          // Add to rollover
          await supabase
            .from('prize_pools')
            .update({ 
              rollover_amount: (prizePool?.rollover_amount || 0) + (totalPool * PRIZE_DISTRIBUTION.five_match)
            })
            .eq('id', prizePool?.id)
        } else {
          // Reset rollover
          await supabase
            .from('prize_pools')
            .update({ rollover_amount: 0 })
            .eq('id', prizePool?.id)
        }
      }

      return NextResponse.json({ data: draw })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Draw API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Publish a draw
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { draw_id, action } = body

    if (action === 'publish') {
      const { data: draw, error } = await supabase
        .from('draws')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', draw_id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ data: draw })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Draw PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
