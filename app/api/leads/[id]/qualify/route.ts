import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { qualifyLead } from '@/lib/ai/qualifyLead'
import type { Lead } from '@/lib/types'

export async function POST(
  _request: Request,
  ctx: RouteContext<'/api/leads/[id]/qualify'>
) {
  const { id } = await ctx.params

  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select()
    .eq('id', id)
    .single()

  // [DEBUG] log fetched lead id and any fetch error
  console.log('[DEBUG leads/qualify] fetched lead id:', id, '| fetchError:', fetchError?.message ?? null)

  if (fetchError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const result = await qualifyLead(lead as Lead)

  // [DEBUG] log full qualification result
  console.log('[DEBUG leads/qualify] qualification result:', JSON.stringify(result, null, 2))

  if (result.qualification_status === 'pending') {
    // [DEBUG] log that the update is being skipped
    console.log('[DEBUG leads/qualify] result is pending — skipping Supabase update')
    return NextResponse.json({ lead }, { status: 200 })
  }

  // [DEBUG] log that the update is proceeding
  console.log('[DEBUG leads/qualify] proceeding with Supabase update for lead id:', id)

  const { data: updated, error: updateError } = await supabase
    .from('leads')
    .update({
      qualification_status: result.qualification_status,
      qualification_score: result.qualification_score,
      summary: result.summary,
      qualification_notes: result.qualification_notes,
      recommended_next_action: result.recommended_next_action,
      missing_information: result.missing_information,
      suggested_reply: result.suggested_reply,
    })
    .eq('id', id)
    .select()
    .single()

  // [DEBUG] log Supabase update outcome
  console.log('[DEBUG leads/qualify] update error:', updateError?.message ?? null, '| updated id:', (updated as Lead | null)?.id ?? null)

  if (updateError) {
    console.error('[leads/qualify] update failed:', updateError.message)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }

  return NextResponse.json({ lead: updated as Lead }, { status: 200 })
}
