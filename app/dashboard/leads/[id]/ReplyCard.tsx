'use client'

import { useState } from 'react'
import type { Tone, Channel } from '@/lib/ai/generateReply'

const TONES: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly',     label: 'Friendly' },
  { value: 'direct',       label: 'Direct' },
]

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'email',     label: 'Email' },
  { value: 'whatsapp',  label: 'WhatsApp / SMS' },
]

const selectClass =
  'rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'

export function ReplyCard({
  leadId,
  initialReply,
}: {
  leadId: string
  initialReply: string | null
}) {
  const [reply,   setReply]   = useState(initialReply ?? '')
  const [tone,    setTone]    = useState<Tone>('professional')
  const [channel, setChannel] = useState<Channel>('email')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [copied,  setCopied]  = useState(false)

  async function regenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone, channel }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error ?? `Request failed with status ${res.status}`)
      }
      setReply(json.suggested_reply)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regeneration failed')
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(reply)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-zinc-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mr-auto">
          Reply Draft
        </p>

        <select
          value={channel}
          onChange={e => setChannel(e.target.value as Channel)}
          disabled={loading}
          className={selectClass}
        >
          {CHANNELS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={tone}
          onChange={e => setTone(e.target.value as Tone)}
          disabled={loading}
          className={selectClass}
        >
          {TONES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <button
          onClick={copy}
          disabled={!reply || loading}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            copied
              ? 'border-green-200 bg-green-50 text-green-600'
              : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>

        <button
          onClick={regenerate}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Regenerating…' : 'Regenerate'}
        </button>
      </div>

      {/* Reply body */}
      <div className="px-6 py-5">
        {reply ? (
          <p className="text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">{reply}</p>
        ) : (
          <p className="text-sm text-zinc-400 italic">
            No reply generated yet — click Regenerate to create one.
          </p>
        )}
      </div>

      {error && (
        <div className="px-6 pb-4">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
