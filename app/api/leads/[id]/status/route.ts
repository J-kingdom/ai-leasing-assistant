import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type Ctx = { params: Promise<{ id: string }> }

const VALID = new Set(['high_intent', 'needs_info', 'low_fit', 'pending'])

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const status =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>).intent_status
      : undefined

  if (typeof status !== 'string' || !VALID.has(status)) {
    return NextResponse.json(
      { error: 'intent_status must be high_intent | needs_info | low_fit | pending' },
      { status: 400 }
    )
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .update({ intent_status: status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lead })
}
