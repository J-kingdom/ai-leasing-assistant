import OpenAI from 'openai'
import { serverEnv } from '@/lib/env.server'
import type { Lead, QualifyLeadResult } from '@/lib/types'

const openai = new OpenAI({ apiKey: serverEnv.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are an AI assistant for a residential leasing company. Your job is to assess inbound lead inquiries and return a structured qualification in JSON.

Scoring rubric (0–100):
- 0–39: low intent or missing critical information
- 40–69: moderate intent, some details present
- 70–100: clear intent, budget and timeline specified

Rules:
- Never invent or assume property-specific facts not present in the inquiry.
- Base your assessment only on what the lead has provided.
- suggested_reply must be professional, address the lead by name, and be under 120 words.

Return a JSON object with exactly these keys:
{
  "qualification_status": "qualified" | "unqualified",
  "qualification_score": number (0–100),
  "summary": string,
  "qualification_notes": string,
  "missing_information": string[],
  "suggested_reply": string,
  "recommended_next_action": string
}

qualification_status is "qualified" if score >= 50, otherwise "unqualified".`

function buildUserPrompt(lead: Lead): string {
  return `Lead inquiry from ${lead.name} (${lead.email}):

Message: ${lead.message}

Additional context:
- Phone: ${lead.phone ?? 'not provided'}
- Property interest: ${lead.property_interest ?? 'not specified'}
- Budget: ${lead.budget != null ? `$${lead.budget}` : 'not specified'}
- Move-in date: ${lead.move_in_date ?? 'not specified'}
- Source: ${lead.source ?? 'unknown'}

Return JSON only.`
}

function pendingFallback(): QualifyLeadResult {
  return {
    qualification_status: 'pending',
    qualification_score: null,
    summary: null,
    qualification_notes: null,
    missing_information: null,
    suggested_reply: null,
    recommended_next_action: null,
  }
}

function shapeGuard(parsed: unknown): QualifyLeadResult | null {
  if (typeof parsed !== 'object' || parsed === null) return null

  const p = parsed as Record<string, unknown>

  if (p.qualification_status !== 'qualified' && p.qualification_status !== 'unqualified') return null
  if (typeof p.qualification_score !== 'number' || p.qualification_score < 0 || p.qualification_score > 100) return null
  if (typeof p.summary !== 'string' || !p.summary) return null
  if (typeof p.qualification_notes !== 'string' || !p.qualification_notes) return null
  if (!Array.isArray(p.missing_information) || !p.missing_information.every((x) => typeof x === 'string')) return null
  if (typeof p.suggested_reply !== 'string' || !p.suggested_reply) return null
  if (typeof p.recommended_next_action !== 'string' || !p.recommended_next_action) return null

  return {
    qualification_status: p.qualification_status,
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
      max_completion_tokens: 600,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(lead) },
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
    console.error('[qualifyLead] JSON.parse failed on content preview:', String(content).slice(0, 200))
    return pendingFallback()
  }

  const result = shapeGuard(parsed)
  if (!result) {
    console.error('[qualifyLead] shape validation failed, keys present:', Object.keys(parsed as object))
    return pendingFallback()
  }

  // [DEBUG] log that shape guard passed and the resolved status/score
  console.log('[DEBUG qualifyLead] shapeGuard passed | status:', result.qualification_status, '| score:', result.qualification_score)

  return result
}
