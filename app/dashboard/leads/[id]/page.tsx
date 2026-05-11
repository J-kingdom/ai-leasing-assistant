import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'
import { CopyButton } from './CopyButton'
import { LeadActions } from './LeadActions'
import { ReplyCard } from './ReplyCard'

const statusStyles: Record<Lead['qualification_status'], string> = {
  pending:     'bg-zinc-50 text-zinc-600 ring-1 ring-inset ring-zinc-500/20',
  qualified:   'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  unqualified: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-500/20',
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-amber-500'
  return 'text-red-500'
}

function scoreBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500'
  if (score >= 40) return 'bg-amber-400'
  return 'bg-red-400'
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <p className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-400 border-b border-zinc-100">
        {title}
      </p>
      <div className="p-5">{children}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-900">{value ?? '—'}</span>
    </div>
  )
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: lead, error } = await supabase
    .from('leads')
    .select()
    .eq('id', id)
    .single()

  if (error || !lead) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors">
            ← All Leads
          </Link>
          <p className="mt-6 text-sm text-zinc-500">Lead not found.</p>
        </div>
      </main>
    )
  }

  const l = lead as Lead

  const dateFormatted = new Date(l.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  })

  const initials = l.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const hasMissing = Array.isArray(l.missing_information) && l.missing_information.length > 0
  const hasAnalysis = !!(l.summary || l.qualification_notes || l.recommended_next_action)

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back */}
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors">
          ← All Leads
        </Link>

        {/* Page header */}
        <div className="mt-6 mb-8 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900">{l.name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[l.qualification_status]}`}>
            {l.qualification_status}
          </span>
          <span className="ml-auto text-xs tabular-nums text-zinc-400">{dateFormatted}</span>
        </div>

        {/* Two-column layout */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">

          {/* ── Main content ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Enquiry timeline */}
            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <p className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-400 border-b border-zinc-100">
                Enquiry
              </p>
              <div className="p-6 space-y-6">
                {/* Lead message */}
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-sm font-medium text-zinc-900">{l.name}</span>
                      <span className="text-xs text-zinc-400">{dateFormatted}</span>
                    </div>
                    <div className="rounded-xl rounded-tl-none bg-zinc-50 border border-zinc-100 px-4 py-3 text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
                      {l.raw_message ?? l.message}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Reply draft */}
            <ReplyCard leadId={l.id} initialReply={l.suggested_reply} />

            {/* AI Analysis — collapsible */}
            {hasAnalysis && (
              <details className="group rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden" open>
                <summary className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 cursor-pointer list-none hover:bg-zinc-50 transition-colors">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">AI Analysis</p>
                  <svg
                    className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>

                <div className="p-6 space-y-5">
                  {l.summary && (
                    <div>
                      <p className="text-xs font-medium text-zinc-400 mb-1.5">Summary</p>
                      <p className="text-sm text-zinc-800 leading-relaxed">{l.summary}</p>
                    </div>
                  )}

                  {l.qualification_notes && (
                    <div>
                      <p className="text-xs font-medium text-zinc-400 mb-1.5">Notes</p>
                      <p className="text-sm text-zinc-800 leading-relaxed">{l.qualification_notes}</p>
                    </div>
                  )}

                  {hasMissing && (
                    <div>
                      <p className="text-xs font-medium text-zinc-400 mb-2">Missing information</p>
                      <div className="flex flex-wrap gap-2">
                        {(l.missing_information as string[]).map((item, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-500/30"
                          >
                            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {String(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {l.recommended_next_action && (
                    <div>
                      <p className="text-xs font-medium text-zinc-400 mb-1.5">Recommended next action</p>
                      <p className="text-sm text-zinc-800 leading-relaxed">{l.recommended_next_action}</p>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>

          {/* ── Sticky sidebar ───────────────────────────────────────── */}
          <div className="mt-5 lg:mt-0">
            <div className="lg:sticky lg:top-20 space-y-4">

              {/* Score card */}
              <SidebarCard title="Score">
                {l.qualification_score != null ? (
                  <>
                    <div className={`text-5xl font-bold tabular-nums leading-none ${scoreColor(l.qualification_score)}`}>
                      {l.qualification_score}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 mb-4">out of 100</p>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full ${scoreBarColor(l.qualification_score)}`}
                        style={{ width: `${l.qualification_score}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-3xl font-semibold text-zinc-200">—</p>
                )}
              </SidebarCard>

              {/* Contact */}
              <SidebarCard title="Contact">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-400">Email</p>
                      <p className="text-sm text-zinc-900 truncate">{l.email}</p>
                    </div>
                    <CopyButton text={l.email} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-400">Phone</p>
                      <p className="text-sm text-zinc-900">{l.phone ?? 'Not provided'}</p>
                    </div>
                    {l.phone && <CopyButton text={l.phone} />}
                  </div>
                </div>
              </SidebarCard>

              {/* Enquiry details */}
              <SidebarCard title="Details">
                <div className="space-y-3">
                  <DetailRow label="Source" value={l.source ?? '—'} />
                  <DetailRow label="Property interest" value={l.property_interest ?? '—'} />
                  <DetailRow label="Budget" value={l.budget != null ? `£${l.budget} pcm` : '—'} />
                  <DetailRow label="Move-in date" value={l.move_in_date ?? '—'} />
                </div>
              </SidebarCard>

              {/* Actions */}
              <SidebarCard title="Actions">
                <LeadActions leadId={l.id} currentStatus={l.qualification_status} />
              </SidebarCard>

            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
