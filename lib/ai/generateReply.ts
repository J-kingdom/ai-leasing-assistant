import OpenAI from 'openai'
import { serverEnv } from '@/lib/env.server'
import type { Lead } from '@/lib/types'

export type Tone    = 'professional' | 'friendly' | 'direct'
export type Channel = 'email' | 'whatsapp'

const openai = new OpenAI({ apiKey: serverEnv.OPENAI_API_KEY })

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  professional: 'Use formal, industry-standard UK lettings language. Be polished and courteous.',
  friendly:     'Use a warm, approachable tone. Be conversational and use the lead\'s first name naturally.',
  direct:       'Be concise and action-focused. Skip pleasantries. Get straight to the point.',
}

const CHANNEL_INSTRUCTIONS: Record<Channel, string> = {
  email:    'Format as an email: include a greeting and a professional sign-off. Keep it under 150 words.',
  whatsapp: 'Format for WhatsApp/SMS: no formal headers or sign-off, conversational line breaks. Keep it under 60 words.',
}

function buildSystemPrompt(tone: Tone, channel: Channel): string {
  return `You are a leasing agent at a UK residential lettings company responding to an inbound enquiry.

Tone: ${TONE_INSTRUCTIONS[tone]}
Format: ${CHANNEL_INSTRUCTIONS[channel]}

Rules:
- Address the lead by their first name.
- Never invent property-specific facts not provided in the enquiry.
- Do not make promises about availability or pricing.
- Return JSON with exactly one key: { "reply": string }`
}

function fmtBool(v: boolean | null, yes: string, no: string) {
  if (v === true)  return yes
  if (v === false) return no
  return 'not stated'
}

function buildUserPrompt(lead: Lead): string {
  return `Write a reply to this lettings enquiry:

From: ${lead.name} (${lead.email})
Message: ${lead.message}

Context:
- Property interest: ${lead.property_interest ?? 'not specified'}
- Budget: ${lead.budget != null ? `£${lead.budget} pcm` : 'not specified'}
- Move-in date: ${lead.move_in_date ?? 'not specified'}
- Phone: ${lead.phone ?? 'not provided'}
- Employment status: ${lead.employment_status ?? 'not stated'}
- Monthly income (applicant): ${lead.applicant_income != null ? `£${lead.applicant_income}` : 'not provided'}
- Monthly income (partner): ${lead.partner_income != null ? `£${lead.partner_income}` : 'not provided'}
- Guarantor available: ${fmtBool(lead.guarantor_available, 'Yes', 'No')}
- Pets: ${fmtBool(lead.pets, 'Yes', 'No')}
- Affordability assessment: ${lead.affordability_status}

Return JSON only: { "reply": "..." }`
}

export async function generateReply(
  lead: Lead,
  tone: Tone,
  channel: Channel,
): Promise<string | null> {
  let content: string | null = null

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_completion_tokens: 300,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildSystemPrompt(tone, channel) },
        { role: 'user',   content: buildUserPrompt(lead) },
      ],
    })
    content = completion.choices[0].message.content
  } catch (err) {
    console.error('[generateReply] OpenAI call failed:', err instanceof Error ? err.message : String(err))
    return null
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content ?? '')
  } catch {
    console.error('[generateReply] JSON.parse failed on:', String(content).slice(0, 200))
    return null
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).reply !== 'string' ||
    !(parsed as Record<string, unknown>).reply
  ) {
    console.error('[generateReply] unexpected shape:', parsed)
    return null
  }

  return (parsed as Record<string, unknown>).reply as string
}
