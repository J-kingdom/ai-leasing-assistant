import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { AffordabilityStatus, IntentStatus, Lead } from '@/lib/types'
import { SeedButton } from './SeedButton'
import { DashboardControls } from './DashboardControls'

const intentStyles: Record<IntentStatus, string> = {
  pending:     'bg-zinc-50 text-zinc-600 ring-1 ring-inset ring-zinc-500/20',
  high_intent: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  needs_info:  'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-500/20',
  low_fit:     'bg-red-50 text-red-600 ring-1 ring-inset ring-red-500/20',
}

const intentLabels: Record<IntentStatus, string> = {
  pending:     'Pending',
  high_intent: 'High Intent',
  needs_info:  'Needs Info',
  low_fit:     'Low Fit',
}

const affordabilityStyles: Record<AffordabilityStatus, string> = {
  pass:    'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  maybe:   'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-500/20',
  fail:    'bg-red-50 text-red-600 ring-1 ring-inset ring-red-500/20',
  unknown: 'bg-zinc-50 text-zinc-500 ring-1 ring-inset ring-zinc-400/20',
}

function truncate(text: string | null, max: number): string {
  if (!text) return '—'
  return text.length > max ? text.slice(0, max) + '…' : text
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>
}) {
  const { q = '', status = 'all', sort = 'newest' } = await searchParams

  const { data: leads, error } = await supabase
    .from('leads')
    .select()
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-8">
        <p className="text-sm text-red-600">Failed to load leads: {error.message}</p>
      </main>
    )
  }

  const allLeads   = (leads ?? []) as Lead[]
  const total      = allLeads.length
  const highIntent = allLeads.filter(l => l.intent_status === 'high_intent').length
  const needsInfo  = allLeads.filter(l => l.intent_status === 'needs_info').length
  const lowFit     = allLeads.filter(l => l.intent_status === 'low_fit').length

  // Filter
  let filtered = allLeads
  if (status !== 'all') {
    filtered = filtered.filter(l => l.intent_status === status)
  }
  if (q.trim()) {
    const lq = q.toLowerCase()
    filtered = filtered.filter(
      l => l.name.toLowerCase().includes(lq) || l.email.toLowerCase().includes(lq)
    )
  }

  // Sort (nulls always last)
  if (sort === 'score_desc') {
    filtered = [...filtered].sort(
      (a, b) => (b.qualification_score ?? -1) - (a.qualification_score ?? -1)
    )
  } else if (sort === 'score_asc') {
    filtered = [...filtered].sort(
      (a, b) => (a.qualification_score ?? 101) - (b.qualification_score ?? 101)
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Leads</h1>
          {process.env.NODE_ENV === 'development' && <SeedButton />}
        </div>

        {/* Stat cards — always reflect the full dataset */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Total</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">{total}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">High Intent</p>
            <p className="mt-2 text-3xl font-semibold text-green-600">{highIntent}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Needs Info</p>
            <p className="mt-2 text-3xl font-semibold text-amber-500">{needsInfo}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Low Fit</p>
            <p className="mt-2 text-3xl font-semibold text-red-500">{lowFit}</p>
          </div>
        </div>

        <DashboardControls q={q} status={status} sort={sort} />

        {allLeads.length === 0 ? (
          <p className="text-sm text-zinc-400">No leads yet.</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-zinc-400">No leads match your filters.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Intent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Affordability</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="font-medium text-zinc-900 hover:text-blue-600 transition-colors"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{lead.email}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{lead.source ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${intentStyles[lead.intent_status]}`}>
                        {intentLabels[lead.intent_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${affordabilityStyles[lead.affordability_status]}`}>
                        {lead.affordability_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums text-zinc-700">
                      {lead.qualification_score ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums text-zinc-400 whitespace-nowrap">
                      {new Date(lead.created_at).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 max-w-xs">{truncate(lead.summary, 80)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
