import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { InboundLeadSchema } from '@/lib/schemas'
import type { Lead } from '@/lib/types'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = InboundLeadSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    )
  }

  const { data: lead, error: dbError } = await supabase
    .from('leads')
    .insert({
      ...result.data,
      qualification_status: 'pending' as const,
      qualification_score: null,
      qualification_notes: null,
      summary: null,
      recommended_next_action: null,
    })
    .select()
    .single()

  if (dbError) {
    console.error('[leads/inbound] insert failed:', dbError.message)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }

  return NextResponse.json({ lead: lead as Lead }, { status: 201 })
}
