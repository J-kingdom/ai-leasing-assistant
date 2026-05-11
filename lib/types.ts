export type QualifyLeadResult =
  | {
      status: 'qualified' | 'unqualified'
      score: number
      summary: string
      recommended_next_action: string
    }
  | {
      status: 'pending'
      score: null
      summary: null
      recommended_next_action: null
    }

export type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  raw_message: string | null
  summary: string | null
  property_interest: string | null
  budget: number | null
  move_in_date: string | null
  source: string | null
  qualification_status: 'pending' | 'qualified' | 'unqualified'
  qualification_score: number | null
  qualification_notes: string | null
  recommended_next_action: string | null
  created_at: string
}
