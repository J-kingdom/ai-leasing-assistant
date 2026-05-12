import OpenAI from 'openai'
import { serverEnv } from '@/lib/env.server'
import type { AffordabilityStatus, Lead, QualifyLeadResult } from '@/lib/types'

const openai = new OpenAI({ apiKey: serverEnv.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are an AI assistant for a UK residential lettings agency. All figures are in GBP (£) per calendar month (pcm). Your job is to assess inbound tenant enquiries and return a structured JSON qualification.

You must assess TWO separate dimensions:

## 1. Intent Assessment (intent_status)
How serious and ready-to-proceed is the lead?
- "high_intent": specific property type, defined budget, move-in date, and sufficient detail to progress
- "needs_info": genuine interest but key details are missing (e.g. no budget, no timeline, no property type)
- "low_fit": vague or speculative enquiry, budget clearly mismatched to stated area, or no clear ask

## 2. Affordability Assessment (affordability_status)
UK standard: gross monthly household income should be ≥ 2.5× the monthly rent (pcm).

Rules you MUST follow — read carefully:
- "pass": household income is explicitly provided AND total ≥ 2.5× budget pcm
- "maybe": income is between 2×–2.5× rent pcm; OR a guarantor is mentioned but income is unknown; OR applicant confirms employment but has not stated an income figure; OR income is self-employed/variable
- "fail": income is explicitly provided AND total household income < 2× budget pcm AND no guarantor is mentioned
- "unknown": budget pcm OR income data is not provided — YOU MUST use "unknown" in this case. NEVER estimate or assume affordability without actual figures. This is the most important rule.

Additional context for affordability:
- Partner/co-applicant income adds to total household income
- Students and unemployed applicants almost always need a guarantor
- Self-employed applicants need 12 months of accounts — default to "maybe" unless accounts are confirmed

## Scoring (0–100)
Reflect both dimensions:
- 80–100: high_intent + pass or maybe affordability
- 60–79: high_intent + unknown affordability, or needs_info + pass
- 40–59: needs_info + unknown or maybe
- 20–39: low_fit, or high_intent + fail with guarantor mentioned
- 0–19: very low intent or high_intent + fail with no guarantor

## Other rules
- Never invent or assume facts not stated in the enquiry
- Do not give legal or financial advice
- suggested_reply must be professional, address the lead by first name, and be under 120 words
- missing_information should list specific items that would help progress the application

Return a JSON object with EXACTLY these keys:
{
  "intent_status": "high_intent" | "needs_info" | "low_fit",
  "affordability_status": "pass" | "maybe" | "fail" | "unknown",
  "qualification_score": number (0–100),
  "summary": string,
  "qualification_notes": string,
  "missing_information": string[],
  "suggested_reply": string,
  "recommended_next_action": string
}`

function fmt(n: number | null, suffix = '') {
  return n != null ? `£${n}${suffix}` : 'not provided'
}

function fmtBool(v: boolean | null, yes: string, no: string) {
  if (v === true)  return yes
  if (v === false) return no
  return 'not stated'
}

function buildUserPrompt(lead: Lead): string {
  const householdIncome =
    lead.applicant_income != null || lead.partner_income != null
      ? `£${(lead.applicant_income ?? 0) + (lead.partner_income ?? 0)} pcm`
      : 'not provided'

  return `Lead enquiry from ${lead.name} (${lead.email}):

Message: ${lead.message}

Structured data provided:
- Phone: ${lead.phone ?? 'not provided'}
- Property interest: ${lead.property_interest ?? 'not specified'}
- Budget (rent): ${lead.budget != null ? `£${lead.budget} pcm` : 'not specified'}
- Move-in date: ${lead.move_in_date ?? 'not specified'}
- Employment status: ${lead.employment_status ?? 'not stated'}
- Applicant monthly income: ${fmt(lead.applicant_income, ' pcm')}
- Partner/co-applicant monthly income: ${fmt(lead.partner_income, ' pcm')}
- Total household monthly income: ${householdIncome}
- Number of adult occupants: ${lead.num_occupants ?? 'not specified'}
- Guarantor available: ${fmtBool(lead.guarantor_available, 'Yes', 'No')}
- Pets: ${fmtBool(lead.pets, 'Yes', 'No')}
- Source: ${lead.source ?? 'unknown'}

Return JSON only.`
}

function pendingFallback(): QualifyLeadResult {
  return {
    intent_status: 'pending',
    affordability_status: null,
    qualification_score: null,
    summary: null,
    qualification_notes: null,
    missing_information: null,
    suggested_reply: null,
    recommended_next_action: null,
  }
}

const VALID_INTENT       = new Set(['high_intent', 'needs_info', 'low_fit'])
const VALID_AFFORDABILITY = new Set<AffordabilityStatus>(['pass', 'maybe', 'fail', 'unknown'])

function shapeGuard(parsed: unknown): QualifyLeadResult | null {
  if (typeof parsed !== 'object' || parsed === null) return null
  const p = parsed as Record<string, unknown>

  if (!VALID_INTENT.has(p.intent_status as string)) return null
  if (!VALID_AFFORDABILITY.has(p.affordability_status as AffordabilityStatus)) return null
  if (typeof p.qualification_score !== 'number' || p.qualification_score < 0 || p.qualification_score > 100) return null
  if (typeof p.summary !== 'string' || !p.summary) return null
  if (typeof p.qualification_notes !== 'string' || !p.qualification_notes) return null
  if (!Array.isArray(p.missing_information) || !p.missing_information.every(x => typeof x === 'string')) return null
  if (typeof p.suggested_reply !== 'string' || !p.suggested_reply) return null
  if (typeof p.recommended_next_action !== 'string' || !p.recommended_next_action) return null

  return {
    intent_status: p.intent_status as 'high_intent' | 'needs_info' | 'low_fit',
    affordability_status: p.affordability_status as AffordabilityStatus,
    qualification_score: p.qualification_score,
    summary: p.summary,
    qualification_notes: p.qualification_notes,
    missing_information: p.missing_information as string[],
    suggested_reply: p.suggested_reply,
    recommended_next_action: p.recommended_next_action,
  }
}

export async function qualifyLead(lead: Lead): Promise<QualifyLeadResult> {
  let content: string | null = null

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_completion_tokens: 700,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(lead) },
      ],
    })
    content = completion.choices[0].message.content
  } catch (err) {
    console.error('[qualifyLead] OpenAI call failed:', err instanceof Error ? err.message : String(err))
    return pendingFallback()
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content ?? '')
  } catch {
    console.error('[qualifyLead] JSON.parse failed:', String(content).slice(0, 200))
    return pendingFallback()
  }

  const result = shapeGuard(parsed)
  if (!result) {
    console.error('[qualifyLead] shape validation failed, keys:', Object.keys(parsed as object))
    return pendingFallback()
  }

  return result
}
