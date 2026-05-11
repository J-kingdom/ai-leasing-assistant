'use client'

import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <button
      onClick={copy}
      className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
        copied
          ? 'bg-green-50 text-green-600'
          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700'
      }`}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
