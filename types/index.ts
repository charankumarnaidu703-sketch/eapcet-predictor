// Matches the DB schema exactly
export interface CutoffRecord {
  id?: number
  college_name: string
  type: string
  year: number
  branch: string
  opening_rank: string
  closing_rank: string
  annual_fees: string
  placement_rating: number | null
  location: string
}

// Input from the prediction form
export interface PredictionInput {
  rank: number
  type: string                     // "Engineering" | "Agriculture"
  location_preference: string[]    // empty = all locations
  branch_preference: string[]      // empty = all branches
  max_fee: number | null           // null = no limit
}

// One result row returned to the UI
export interface PredictionResult {
  college_name: string
  type: string
  branch: string
  location: string
  annual_fees: string
  placement_rating: number | null
  probability_label: 'Safe' | 'Moderate' | 'Reach' | 'Ambitious' | 'Data Unavailable'
  probability_percent: number | null
  closing_rank_latest: string
  cutoff_trend: { year: number; closing_rank: string }[]
}

// Counselling event
export interface CounsellingEvent {
  id: string
  title: string
  description: string
  date: string          // ISO date string
  state: 'AP' | 'Telangana' | 'Both'
  category?: string
  isImportant: boolean
}

// Scholarship / reimbursement scheme
export interface Scheme {
  id: string
  name: string
  state: 'AP' | 'Telangana' | 'Central'
  eligibleCategories: string[]
  maxAnnualIncome: number
  amount: string
  description: string
  applyUrl: string
  documents: string[]
}
