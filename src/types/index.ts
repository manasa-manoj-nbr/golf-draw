// Database Types
export type UserRole = 'user' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due'
export type SubscriptionPlan = 'monthly' | 'yearly'
export type DrawStatus = 'pending' | 'completed' | 'published'
export type DrawType = 'random' | 'algorithmic'
export type MatchType = 'five_match' | 'four_match' | 'three_match'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type PayoutStatus = 'pending' | 'paid'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  charity_id: string | null
  charity_percentage: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: SubscriptionPlan
  status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  played_date: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url: string | null
  website: string | null
  is_featured: boolean
  is_active: boolean
  events: CharityEvent[]
  total_donations: number
  created_at: string
  updated_at: string
}

export interface CharityEvent {
  title: string
  description: string
  date: string
  location: string
}

export interface Draw {
  id: string
  draw_date: string
  winning_numbers: number[]
  draw_type: DrawType
  status: DrawStatus
  jackpot_amount: number
  total_pool_amount: number
  five_match_pool: number
  four_match_pool: number
  three_match_pool: number
  rollover_amount: number
  created_at: string
  published_at: string | null
}

export interface Winner {
  id: string
  draw_id: string
  user_id: string
  match_type: MatchType
  matched_numbers: number[]
  prize_amount: number
  proof_url: string | null
  verification_status: VerificationStatus
  payout_status: PayoutStatus
  admin_notes: string | null
  created_at: string
  verified_at: string | null
  paid_at: string | null
  user?: User
  draw?: Draw
}

export interface Donation {
  id: string
  user_id: string
  charity_id: string
  amount: number
  donation_type: 'subscription' | 'independent'
  created_at: string
  charity?: Charity
}

export interface PrizePool {
  id: string
  month: string
  total_amount: number
  five_match_pool: number
  four_match_pool: number
  three_match_pool: number
  rollover_amount: number
  subscriber_count: number
  created_at: string
  updated_at: string
}

// Form Types
export interface ScoreFormData {
  score: number
  played_date: string
}

export interface ProfileFormData {
  full_name: string
  charity_id: string | null
  charity_percentage: number
}

export interface CharityFormData {
  name: string
  description: string
  image_url: string
  website: string
  is_featured: boolean
  is_active: boolean
  events: CharityEvent[]
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Dashboard Stats Types
export interface UserDashboardStats {
  subscription_status: SubscriptionStatus | null
  subscription_plan: SubscriptionPlan | null
  renewal_date: string | null
  total_winnings: number
  pending_payouts: number
  draws_entered: number
  upcoming_draw_date: string | null
  selected_charity: Charity | null
  charity_contribution_total: number
}

export interface AdminDashboardStats {
  total_users: number
  active_subscribers: number
  total_prize_pool: number
  current_jackpot: number
  total_charity_donations: number
  pending_verifications: number
  draws_this_month: number
  monthly_revenue: number
}

// Pricing
export const PRICING = {
  monthly: {
    amount: 14.99,
    interval: 'month' as const,
    label: 'Monthly',
  },
  yearly: {
    amount: 129,
    interval: 'year' as const,
    label: 'Yearly',
    savings: '28%',
  },
} as const

// Prize Pool Distribution
export const PRIZE_DISTRIBUTION = {
  five_match: 0.40,
  four_match: 0.35,
  three_match: 0.25,
} as const

export const SUBSCRIPTION_POOL_PERCENTAGE = 0.50
export const MIN_CHARITY_PERCENTAGE = 0.10
export const PLATFORM_PERCENTAGE = 0.40
