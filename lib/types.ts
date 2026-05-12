export type IntentStatus       = 'high_intent' | 'needs_info' | 'low_fit' | 'pending'
export type AffordabilityStatus = 'pass' | 'maybe' | 'fail' | 'unknown'

export type QualifyLeadResult =
  | {
      intent_status: 'high_intent' | 'needs_info' | 'low_fit'
      affordability_status: AffordabilityStatus
      qualification_score: number
      summary: string
      qualification_notes: string
      missing_information: string[]
      suggested_reply: string
      recommended_next_action: string
    }
  | {
      intent_status: 'pending'
      affordability_status: null
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
  // Legacy field — kept in DB, written by manual overrides only
  qualification_status: 'pending' | 'qualified' | 'unqualified'
  qualification_score: number | null
  qualification_notes: string | null
  missing_information: string[] | null
  suggested_reply: string | null
  recommended_next_action: string | null
  // New qualification model
  intent_status: IntentStatus
  affordability_status: AffordabilityStatus
  applicant_income: number | null
  partner_income: number | null
  guarantor_available: boolean | null
  num_occupants: number | null
  pets: boolean | null
  employment_status: string | null
  created_at: string
}
