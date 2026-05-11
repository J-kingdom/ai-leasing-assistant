import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateReply, type Tone, type Channel } from '@/lib/ai/generateReply'
import type { Lead } from '@/lib/types'

type Ctx = { params: Promise<{ id: string }> }

const VALID_TONES    = new Set<Tone>(['professional', 'friendly', 'direct'])
const VALID_CHANNELS = new Set<Channel>(['email', 'whatsapp'])

export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
  const tone    = b.tone    as string | undefined
  const channel = b.channel as string | undefined

  if (!tone || !VALID_TONES.has(tone as Tone)) {
    return NextResponse.json(
      { error: 'tone must be professional | friendly | direct' },
      { status: 400 }
    )
  }
  if (!channel || !VALID_CHANNELS.has(channel as Channel)) {
    return NextResponse.json(
      { error: 'channel must be email | whatsapp' },
      { status: 400 }
    )
  }

  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select()
    .eq('id', id)
    .single()

  if (fetchError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const reply = await generateReply(lead as Lead, tone as Tone, channel as Channel)
  if (!reply) {
    return NextResponse.json({ error: 'Reply generation failed' }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from('leads')
    .update({ suggested_reply: reply })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ suggested_reply: reply })
}
