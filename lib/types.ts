export type QualifyLeadResult =
  | {
      qualification_status: 'qualified' | 'unqualified'
      qualification_score: number
      summary: string
      qualification_notes: string
      missing_information: string[]
      suggested_reply: string
      recommended_next_action: string
    }
  | {
      qualification_status: 'pending'
      qualification_score: null
      summary: null
      qualification_notes: null
      missing_information: null
      suggested_reply: null
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
  missing_information: string[] | null
  suggested_reply: string | null
  recommended_next_action: string | null
  created_at: string
}
