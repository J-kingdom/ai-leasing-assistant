'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useRef } from 'react'

const STATUS_TABS = [
  { label: 'All',          value: 'all' },
  { label: 'Qualified',    value: 'qualified' },
  { label: 'Pending',      value: 'pending' },
  { label: 'Unqualified',  value: 'unqualified' },
] as const

const SORT_OPTIONS = [
  { label: 'Newest first',   value: 'newest' },
  { label: 'Highest score',  value: 'score_desc' },
  { label: 'Lowest score',   value: 'score_asc' },
] as const

type Props = { q: string; status: string; sort: string }

export function DashboardControls({ q, status, sort }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const timer    = useRef<ReturnType<typeof setTimeout> | null>(null)

  function push(updates: Partial<{ q: string; status: string; sort: string }>) {
    const next = { q, status, sort, ...updates }
    const params = new URLSearchParams()
    if (next.q)                params.set('q',      next.q)
    if (next.status !== 'all') params.set('status', next.status)
    if (next.sort !== 'newest') params.set('sort',  next.sort)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div className="flex gap-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => push({ status: tab.value })}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              status === tab.value
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2">
        <input
          type="search"
          defaultValue={q}
          placeholder="Search name or email…"
          onChange={e => {
            if (timer.current !== null) clearTimeout(timer.current)
            const val = e.target.value
            timer.current = setTimeout(() => push({ q: val }), 300)
          }}
          className="w-52 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <select
          value={sort}
          onChange={e => push({ sort: e.target.value })}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
