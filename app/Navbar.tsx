'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Submit Lead', href: '/submit' },
]

export function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const onDashboard = pathname.startsWith('/dashboard')

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-12 w-full max-w-7xl mx-auto px-8">
        <Link href="/" className="shrink-0 flex items-center">
          <Image
            src="/logo.png.png"
            alt="LettingsCopilot"
            height={48}
            width={288}
            className="h-12 w-auto"
            sizes="288px"
            priority
          />
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
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
        {onDashboard && (
          <button
            onClick={handleSignOut}
            className="ml-auto text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  )
}
