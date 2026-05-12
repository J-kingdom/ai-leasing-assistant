import Link from 'next/link'

const PROBLEMS = [
  {
    headline: 'Intent masked by politeness',
    body: 'Friendly enquiries can sound promising while carrying no usable signal. Your team wastes time chasing tenants who were never likely to proceed.',
  },
  {
    headline: 'Affordability issues spotted too late',
    body: 'Agents often discover income problems after viewings and follow-ups have already happened — costing time, effort, and pipeline clarity.',
  },
  {
    headline: 'Critical details never collected',
    body: 'Employment status, household income, guarantors, and occupancy details are often missing from initial enquiries.',
  },
]

const FEATURES: { title: string; desc: string; iconPath: string }[] = [
  {
    title: 'Intent Assessment',
    desc: 'Every enquiry classified as High Intent, Needs Info, or Low Fit based on clarity, urgency, and completeness.',
    iconPath: 'm3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  },
  {
    title: 'Affordability Signal Detection',
    desc: 'AI assesses household income, partner income, and guarantor context against the tenant\'s stated budget.',
    iconPath: 'M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  {
    title: 'Missing Information Alerts',
    desc: 'Amber warnings surface exactly what\'s missing — income figures, guarantor details, move-in dates, and more.',
    iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  },
  {
    title: 'Smart Reply Drafts',
    desc: 'Generate personalised replies informed by the lead\'s affordability context and missing information.',
    iconPath: 'M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z',
  },
  {
    title: 'Centralised Pipeline',
    desc: 'All inbound tenant enquiries in one searchable dashboard with intent and affordability visibility.',
    iconPath: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V6.375A1.125 1.125 0 0 1 3.375 5.25h17.25a1.125 1.125 0 0 1 1.125 1.125V18.375A1.125 1.125 0 0 1 20.625 19.5m-16.5 0H6',
  },
  {
    title: 'One-Click Re-qualification',
    desc: 'Re-run AI analysis instantly when applicants provide new income or guarantor information.',
    iconPath: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
  },
]

const STEPS = [
  { title: 'Tenant submits enquiry',     desc: 'Name, budget, income, employment, and guarantor details captured in one form.' },
  { title: 'AI assesses intent',         desc: 'High Intent, Needs Info, or Low Fit assigned based on enquiry quality.' },
  { title: 'Affordability gaps flagged', desc: 'Household income checked against affordability expectations. Missing data surfaced instantly.' },
  { title: 'Reply draft generated',      desc: 'Contextual response ready to send by email or WhatsApp.' },
  { title: 'Pipeline stays clean',       desc: 'Your team sees which leads are actionable before wasting time on dead-end enquiries.' },
]

const MOCK_LEADS = [
  { name: 'Sarah Mitchell', intent: 'High Intent', affordability: 'Pass',  score: 85, budget: '£2,200 pcm', date: '2 May 2026' },
  { name: "James O'Brien",  intent: 'High Intent', affordability: 'Pass',  score: 74, budget: '£950 pcm',   date: '5 May 2026' },
  { name: 'Amira Hassan',   intent: 'Needs Info',  affordability: 'Maybe', score: 55, budget: '£1,100 pcm', date: '9 May 2026' },
  { name: 'Marcus Webb',    intent: 'Low Fit',     affordability: 'Fail',  score: 28, budget: '£1,400 pcm', date: '10 May 2026' },
]

const intentStyles = {
  'High Intent': 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  'Needs Info':  'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-500/20',
  'Low Fit':     'bg-red-50 text-red-600 ring-1 ring-inset ring-red-500/20',
} as Record<string, string>

const affordabilityStyles = {
  'Pass':  'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  'Maybe': 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-500/20',
  'Fail':  'bg-red-50 text-red-600 ring-1 ring-inset ring-red-500/20',
} as Record<string, string>

const STAT_CARDS = [
  { label: 'Total',       value: '4', cls: 'text-zinc-900' },
  { label: 'High Intent', value: '2', cls: 'text-green-600' },
  { label: 'Needs Info',  value: '1', cls: 'text-amber-500' },
  { label: 'Low Fit',     value: '1', cls: 'text-red-500' },
]

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 px-6 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-400 mb-8">
            Built for UK Letting Agencies
          </span>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white mb-6 leading-tight">
            Know your leads<br />before you call them.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            LettingsCopilot assesses tenant enquiries for intent and affordability —
            flagging missing income data, guarantor gaps, and low-fit leads before your team wastes time on them.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:joseph@lettingscopilot.com?subject=LettingsCopilot%20Demo%20Request"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Book a Demo
            </a>
            <Link
              href="/dashboard"
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              View Sample Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Strip ────────────────────────────────────────────────── */}
      <div className="border-y border-zinc-200 bg-zinc-50 py-4 px-6">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-zinc-400">
          Built for UK letting agencies
        </p>
      </div>

      {/* ── Problem ──────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">The Problem</p>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-16 max-w-xl">
            Your inbox is costing you deals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {PROBLEMS.map((p) => (
              <div key={p.headline}>
                <p className="text-base font-semibold text-zinc-900 mb-2">{p.headline}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="bg-zinc-50 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Features</p>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-12 max-w-xl">
            Two signals. One clear picture.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.iconPath} />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-zinc-900 mb-1.5">{f.title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ─────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">How it works</p>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-16 max-w-xl">
            From enquiry to reply in under a minute
          </h2>
          <div className="relative">
            <div className="absolute top-4 left-[5%] right-[5%] h-px bg-zinc-100 hidden sm:block" />
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-8">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex flex-col items-start sm:items-center text-left sm:text-center">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-400 mb-4 shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 mb-1">{step.title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mock Dashboard ───────────────────────────────────────── */}
      <section className="bg-zinc-950 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">See it in action</p>
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-12 max-w-xl">
            Intent and affordability, at a glance
          </h2>

          {/* Browser chrome mock */}
          <div className="rounded-xl overflow-hidden border border-zinc-700 shadow-2xl">
            <div className="bg-zinc-800 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <div className="ml-4 h-5 w-48 rounded bg-zinc-700" />
            </div>

            <div className="bg-zinc-50 p-5">
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {STAT_CARDS.map(({ label, value, cls }) => (
                  <div key={label} className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
                    <p className={`mt-1 text-xl font-semibold tabular-nums ${cls}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Leads table */}
              <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      {['Name', 'Intent', 'Affordability', 'Score', 'Budget', 'Date'].map((col) => (
                        <th key={col} className="px-3 py-2.5 text-left font-medium uppercase tracking-wide text-zinc-400">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {MOCK_LEADS.map((lead) => (
                      <tr key={lead.name} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-zinc-900 whitespace-nowrap">{lead.name}</td>
                        <td className="px-3 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${intentStyles[lead.intent]}`}>
                            {lead.intent}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${affordabilityStyles[lead.affordability]}`}>
                            {lead.affordability}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 tabular-nums font-medium text-zinc-700">{lead.score}</td>
                        <td className="px-3 py-2.5 text-zinc-500 whitespace-nowrap">{lead.budget}</td>
                        <td className="px-3 py-2.5 text-zinc-400 whitespace-nowrap">{lead.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              Open Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────── */}
      <section className="bg-zinc-50 border-t border-zinc-200 px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-4">
            Know your leads before you call them
          </h2>
          <p className="text-base text-zinc-500 mb-10">
            Intent assessed. Affordability surfaced. Reply drafted. All in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:joseph@lettingscopilot.com?subject=LettingsCopilot%20Demo%20Request"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Book a Demo
            </a>
            <Link
              href="/dashboard"
              className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              View Sample Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-white">LettingsCopilot</p>
            <p className="text-sm text-zinc-500 mt-0.5">Intent and affordability intelligence for UK letting agencies</p>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/submit"    className="text-sm text-zinc-500 hover:text-white transition-colors">Submit Lead</Link>
          </nav>
        </div>
        <div className="border-t border-zinc-800">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <p className="text-xs text-zinc-600">© 2026 LettingsCopilot</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
