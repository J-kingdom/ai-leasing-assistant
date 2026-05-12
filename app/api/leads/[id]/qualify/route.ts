import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { qualifyLead } from '@/lib/ai/qualifyLead'
import type { Lead } from '@/lib/types'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params

  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select()
    .eq('id', id)
    .single()

  if (fetchError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const result = await qualifyLead(lead as Lead)

  if (result.intent_status === 'pending') {
    return NextResponse.json({ lead }, { status: 200 })
  }

  const { data: updated, error: updateError } = await supabase
    .from('leads')
    .update({
      intent_status:            result.intent_status,
      affordability_status:     result.affordability_status,
      qualification_score:      result.qualification_score,
      summary:                  result.summary,
      qualification_notes:      result.qualification_notes,
      recommended_next_action:  result.recommended_next_action,
      missing_information:      result.missing_information,
      suggested_reply:          result.suggested_reply,
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('[leads/qualify] update failed:', updateError.message)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }

  return NextResponse.json({ lead: updated as Lead }, { status: 200 })
}
