'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SeedButton() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSeed() {
    setStatus('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/dev/seed', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Seed failed with status ${res.status}`)
      }
      setStatus('done')
      router.refresh()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Seed failed')
      setStatus('error')
    }
  }

  return (
    <div className="flex items-center gap-3">
      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
      <button
        onClick={handleSeed}
        disabled={status === 'loading' || status === 'done'}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'loading' ? 'Seeding…' : status === 'done' ? 'Seeded ✓' : 'Seed Demo Data'}
      </button>
    </div>
  )
}
