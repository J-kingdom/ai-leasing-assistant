'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Submit Lead', href: '/submit' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 h-14 flex items-center border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-8 w-full max-w-7xl mx-auto px-8">
        <span className="text-sm font-semibold tracking-tight text-white">
          LettingsCopilot
        </span>
        <nav className="flex items-center gap-1">
          {navLinks.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
