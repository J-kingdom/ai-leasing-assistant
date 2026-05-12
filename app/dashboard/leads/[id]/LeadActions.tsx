'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IntentStatus } from '@/lib/types'

const STATUS_BUTTONS: {
  status: IntentStatus
  label: string
  activeClass: string
  inactiveClass: string
}[] = [
  {
    status: 'high_intent',
    label: 'Mark High Intent',
    activeClass: 'border-green-200 bg-green-50 text-green-700 opacity-40 cursor-default',
    inactiveClass: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
  },
  {
    status: 'needs_info',
    label: 'Mark Needs Info',
    activeClass: 'border-amber-200 bg-amber-50 text-amber-700 opacity-40 cursor-default',
    inactiveClass: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  },
  {
    status: 'low_fit',
    label: 'Mark Low Fit',
    activeClass: 'border-red-200 bg-red-50 text-red-700 opacity-40 cursor-default',
    inactiveClass: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  },
  {
    status: 'pending',
    label: 'Set Pending',
    activeClass: 'border-zinc-200 bg-zinc-50 text-zinc-500 opacity-40 cursor-default',
    inactiveClass: 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100',
  },
]

export function LeadActions({
  leadId,
  currentStatus,
}: {
  leadId: string
  currentStatus: IntentStatus
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const busy = loading !== null

  async function setStatus(status: IntentStatus) {
    setLoading(status)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent_status: status }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Request failed with status ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setLoading(null)
    }
  }

  async function requalify() {
    setLoading('qualify')
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}/qualify`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Request failed with status ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Qualification failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-2">
      {STATUS_BUTTONS.map(({ status, label, activeClass, inactiveClass }) => (
        <button
          key={status}
          onClick={() => setStatus(status)}
          disabled={busy || currentStatus === status}
          className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
            currentStatus === status ? activeClass : inactiveClass
          } ${busy && currentStatus !== status ? 'opacity-50' : ''}`}
        >
          {loading === status ? 'Saving…' : label}
        </button>
      ))}

      <button
        onClick={requalify}
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'qualify' ? 'Analysing…' : 'Run AI Qualification'}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
