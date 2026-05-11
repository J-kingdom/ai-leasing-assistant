import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'

const statusStyles: Record<Lead['qualification_status'], string> = {
  pending: 'bg-zinc-100 text-zinc-600',
  qualified: 'bg-green-100 text-green-700',
  unqualified: 'bg-red-100 text-red-700',
}

function truncate(text: string | null, max: number): string {
  if (!text) return '—'
  return text.length > max ? text.slice(0, max) + '…' : text
}

export default async function DashboardPage() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select()
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-600">Failed to load leads: {error.message}</p>
      </main>
    )
  }

  const typedLeads = (leads ?? []) as Lead[]
  const total       = typedLeads.length
  const qualified   = typedLeads.filter(l => l.qualification_status === 'qualified').length
  const pending     = typedLeads.filter(l => l.qualification_status === 'pending').length
  const unqualified = typedLeads.filter(l => l.qualification_status === 'unqualified').length

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Leads</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Total Leads</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-800">{total}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Qualified</p>
          <p className="mt-1 text-3xl font-semibold text-green-600">{qualified}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Pending</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-500">{pending}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Unqualified</p>
          <p className="mt-1 text-3xl font-semibold text-red-600">{unqualified}</p>
        </div>
      </div>

      {!leads || leads.length === 0 ? (
        <p className="text-zinc-500">No leads yet.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-zinc-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-left text-zinc-500 font-medium">
                <th className="px-4 py-3 border-b border-zinc-200">Name</th>
                <th className="px-4 py-3 border-b border-zinc-200">Email</th>
                <th className="px-4 py-3 border-b border-zinc-200">Source</th>
                <th className="px-4 py-3 border-b border-zinc-200">Status</th>
                <th className="px-4 py-3 border-b border-zinc-200">Score</th>
                <th className="px-4 py-3 border-b border-zinc-200">Date</th>
                <th className="px-4 py-3 border-b border-zinc-200">Summary</th>
                <th className="px-4 py-3 border-b border-zinc-200">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {typedLeads.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={i % 2 === 0 ? 'bg-white hover:bg-zinc-50' : 'bg-zinc-50 hover:bg-zinc-100'}
                >
                  <td className="px-4 py-3 border-b border-zinc-100">
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 border-b border-zinc-100 text-zinc-700">{lead.email}</td>
                  <td className="px-4 py-3 border-b border-zinc-100 text-zinc-500">{lead.source ?? '—'}</td>
                  <td className="px-4 py-3 border-b border-zinc-100">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[lead.qualification_status]}`}
                    >
                      {lead.qualification_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-zinc-100 text-zinc-700">
                    {lead.qualification_score ?? '—'}
                  </td>
                  <td className="px-4 py-3 border-b border-zinc-100 text-zinc-500 whitespace-nowrap">
                    {new Date(lead.created_at).toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 border-b border-zinc-100 text-zinc-600 max-w-xs">
                    {truncate(lead.summary, 80)}
                  </td>
                  <td className="px-4 py-3 border-b border-zinc-100 text-zinc-600 max-w-xs">
                    {truncate(lead.recommended_next_action, 80)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
