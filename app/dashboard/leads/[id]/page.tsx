import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'
import { QualifyButton } from './QualifyButton'

const statusStyles: Record<Lead['qualification_status'], string> = {
  pending: 'bg-zinc-100 text-zinc-600',
  qualified: 'bg-green-100 text-green-700',
  unqualified: 'bg-red-100 text-red-700',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-sm text-zinc-800">{children}</dd>
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
      <main className="p-8 max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← All Leads
        </Link>
        <p className="mt-6 text-zinc-500">Lead not found.</p>
      </main>
    )
  }

  const l = lead as Lead

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← All Leads
      </Link>

      {/* Header */}
      <div className="mt-6 flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-semibold">{l.name}</h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[l.qualification_status]}`}
        >
          {l.qualification_status}
        </span>
        {l.qualification_score != null && (
          <span className="text-sm text-zinc-500">Score: {l.qualification_score}</span>
        )}
      </div>

      {/* Contact */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Contact</h2>
        <dl>
          <Field label="Email">{l.email}</Field>
          <Field label="Phone">{l.phone ?? 'Not provided'}</Field>
        </dl>
      </section>

      {/* Enquiry */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Enquiry</h2>
        <dl>
          <Field label="Source">{l.source ?? '—'}</Field>
          <Field label="Property interest">{l.property_interest ?? '—'}</Field>
          <Field label="Budget">{l.budget != null ? `$${l.budget}` : '—'}</Field>
          <Field label="Move-in date">{l.move_in_date ?? '—'}</Field>
          <Field label="Message">
            <p className="whitespace-pre-wrap">{l.message}</p>
          </Field>
          {l.raw_message && l.raw_message !== l.message && (
            <Field label="Raw message">
              <p className="whitespace-pre-wrap text-zinc-600">{l.raw_message}</p>
            </Field>
          )}
        </dl>
      </section>

      {/* Qualification */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Qualification</h2>
        <dl>
          <Field label="Summary">{l.summary ?? '—'}</Field>
          <Field label="Notes">{l.qualification_notes ?? '—'}</Field>
          <Field label="Missing information">
            {!Array.isArray(l.missing_information) || l.missing_information.length === 0 ? (
              'None'
            ) : (
              <ul className="list-disc list-inside">
                {l.missing_information.map((item, idx) => (
                  <li key={idx}>{String(item)}</li>
                ))}
              </ul>
            )}
          </Field>
          <Field label="Suggested reply">
            {l.suggested_reply ? (
              <div className="border-l-4 border-zinc-300 pl-4 text-zinc-700 whitespace-pre-wrap">
                {l.suggested_reply}
              </div>
            ) : (
              '—'
            )}
          </Field>
          <Field label="Recommended next action">{l.recommended_next_action ?? '—'}</Field>
        </dl>
      </section>

      {/* Actions */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Actions</h2>
        <QualifyButton leadId={l.id} />
      </section>
    </main>
  )
}
