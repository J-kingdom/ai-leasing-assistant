'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'qualifying' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputBase =
  'w-full rounded-lg border px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
const inputNormal = `${inputBase} border-zinc-300`
const inputError  = `${inputBase} border-red-400`

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-sm text-red-600">{msg}</p>
}

function RadioGroup({
  name,
  value,
  onChange,
  disabled,
}: {
  name: string
  value: boolean | null
  onChange: (v: boolean | null) => void
  disabled: boolean
}) {
  return (
    <div className="flex gap-4">
      {(['yes', 'no'] as const).map(opt => {
        const val = opt === 'yes'
        const checked = value === val
        return (
          <label key={opt} className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={checked}
              onChange={() => onChange(val)}
              disabled={disabled}
              className="accent-blue-600"
            />
            <span className="text-sm text-zinc-700">{opt === 'yes' ? 'Yes' : 'No'}</span>
          </label>
        )
      })}
    </div>
  )
}

export default function SubmitPage() {
  const [status, setStatus]           = useState<Status>('idle')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submittedName, setSubmittedName] = useState('')

  // Core fields
  const [name, setName]                         = useState('')
  const [email, setEmail]                       = useState('')
  const [phone, setPhone]                       = useState('')
  const [message, setMessage]                   = useState('')
  const [propertyInterest, setPropertyInterest] = useState('')
  const [budget, setBudget]                     = useState('')
  const [moveInDate, setMoveInDate]             = useState('')

  // Affordability fields
  const [employmentStatus, setEmploymentStatus]     = useState('')
  const [applicantIncome, setApplicantIncome]       = useState('')
  const [partnerIncome, setPartnerIncome]           = useState('')
  const [numOccupants, setNumOccupants]             = useState('')
  const [guarantorAvailable, setGuarantorAvailable] = useState<boolean | null>(null)
  const [pets, setPets]                             = useState<boolean | null>(null)

  const busy = status === 'submitting' || status === 'qualifying'

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {}
    if (!name.trim())                      errors.name    = 'Name is required.'
    if (!email.trim())                     errors.email   = 'Email is required.'
    else if (!EMAIL_RE.test(email.trim())) errors.email   = 'Enter a valid email address.'
    if (!message.trim())                   errors.message = 'Message is required.'
    return errors
  }

  function resetForm() {
    setStatus('idle')
    setFieldErrors({})
    setServerError(null)
    setSubmittedName('')
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
    setPropertyInterest('')
    setBudget('')
    setMoveInDate('')
    setEmploymentStatus('')
    setApplicantIncome('')
    setPartnerIncome('')
    setNumOccupants('')
    setGuarantorAvailable(null)
    setPets(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setStatus('submitting')

    const body: Record<string, unknown> = {
      name:    name.trim(),
      email:   email.trim(),
      message: message.trim(),
      source:  'web_form',
    }
    if (phone.trim())            body.phone              = phone.trim()
    if (propertyInterest.trim()) body.property_interest  = propertyInterest.trim()
    if (moveInDate)              body.move_in_date       = moveInDate
    if (budget !== '')           body.budget             = Number(budget)
    if (employmentStatus)        body.employment_status  = employmentStatus
    if (applicantIncome !== '')  body.applicant_income   = Number(applicantIncome)
    if (partnerIncome !== '')    body.partner_income     = Number(partnerIncome)
    if (numOccupants !== '')     body.num_occupants      = Number(numOccupants)
    if (guarantorAvailable !== null) body.guarantor_available = guarantorAvailable
    if (pets !== null)           body.pets               = pets

    let leadId: string
    try {
      const res = await fetch('/api/leads/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        if (res.status === 400 && Array.isArray(json.issues)) {
          const errs: Record<string, string> = {}
          for (const issue of json.issues) {
            const field = Array.isArray(issue.path) ? String(issue.path[0]) : ''
            if (field && !errs[field]) errs[field] = issue.message ?? 'Invalid value.'
          }
          if (Object.keys(errs).length > 0) {
            setFieldErrors(errs)
            setStatus('error')
            return
          }
        }
        setServerError('Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      const json = await res.json()
      leadId = json.lead?.id
      setSubmittedName(name.trim())
    } catch {
      setServerError('Network error. Please check your connection and try again.')
      setStatus('error')
      return
    }

    setStatus('qualifying')

    try {
      await fetch(`/api/leads/${leadId}/qualify`, { method: 'POST' })
    } catch {
      // swallow — lead is created; qualification stays pending
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-xl bg-white rounded-xl border border-zinc-200 p-8 shadow-lg text-center">
          <p className="text-green-500 text-5xl mb-4">✓</p>
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
            Thank you, {submittedName}!
          </h1>
          <p className="text-zinc-500 text-sm mb-8">
            Your enquiry has been received and our team will be in touch shortly.
          </p>
          <button onClick={resetForm} className="text-sm text-blue-600 hover:underline">
            Submit another enquiry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-xl bg-white rounded-xl border border-zinc-200 p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-1">Get in Touch</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Tell us about what you&apos;re looking for and we&apos;ll be in touch.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-800 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={busy}
              className={fieldErrors.name ? inputError : inputNormal}
              autoComplete="name"
            />
            <FieldError msg={fieldErrors.name} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-800 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={busy}
              className={fieldErrors.email ? inputError : inputNormal}
              autoComplete="email"
            />
            <FieldError msg={fieldErrors.email} />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-800 mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={busy}
              className={inputNormal}
              autoComplete="tel"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-zinc-800 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={busy}
              className={fieldErrors.message ? inputError : inputNormal}
            />
            <FieldError msg={fieldErrors.message} />
          </div>

          {/* Property interest */}
          <div>
            <label htmlFor="property_interest" className="block text-sm font-medium text-zinc-800 mb-1">
              Property interest
            </label>
            <input
              id="property_interest"
              type="text"
              placeholder="e.g. 2-bed flat, city centre"
              value={propertyInterest}
              onChange={e => setPropertyInterest(e.target.value)}
              disabled={busy}
              className={inputNormal}
            />
          </div>

          {/* Budget + Move-in date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-zinc-800 mb-1">
                Budget (£/month)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none select-none">£</span>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="e.g. 1500"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  disabled={busy}
                  style={{ paddingLeft: '1.75rem' }}
                  className={inputNormal}
                />
              </div>
            </div>
            <div>
              <label htmlFor="move_in_date" className="block text-sm font-medium text-zinc-800 mb-1">
                Desired move-in date
              </label>
              <input
                id="move_in_date"
                type="date"
                value={moveInDate}
                onChange={e => setMoveInDate(e.target.value)}
                disabled={busy}
                className={inputNormal}
              />
            </div>
          </div>

          {/* ── Affordability section ─────────────────────────────────── */}
          <div className="border-t border-zinc-100 pt-5">
            <p className="text-sm font-medium text-zinc-800 mb-1">About your situation</p>
            <p className="text-xs text-zinc-400 mb-4">Optional — helps us assess your application faster.</p>

            <div className="space-y-4">
              {/* Employment status */}
              <div>
                <label htmlFor="employment_status" className="block text-sm font-medium text-zinc-800 mb-1">
                  Employment status
                </label>
                <select
                  id="employment_status"
                  value={employmentStatus}
                  onChange={e => setEmploymentStatus(e.target.value)}
                  disabled={busy}
                  className={`${inputNormal} bg-white`}
                >
                  <option value="">Select…</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-employed</option>
                  <option value="student">Student</option>
                  <option value="unemployed">Not currently employed</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              {/* Income grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="applicant_income" className="block text-sm font-medium text-zinc-800 mb-1">
                    Your monthly income (£ gross)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none select-none">£</span>
                    <input
                      id="applicant_income"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="e.g. 3500"
                      value={applicantIncome}
                      onChange={e => setApplicantIncome(e.target.value)}
                      disabled={busy}
                      style={{ paddingLeft: '1.75rem' }}
                      className={inputNormal}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="partner_income" className="block text-sm font-medium text-zinc-800 mb-1">
                    Partner / co-applicant income (£)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none select-none">£</span>
                    <input
                      id="partner_income"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="if applicable"
                      value={partnerIncome}
                      onChange={e => setPartnerIncome(e.target.value)}
                      disabled={busy}
                      style={{ paddingLeft: '1.75rem' }}
                      className={inputNormal}
                    />
                  </div>
                </div>
              </div>

              {/* Occupants */}
              <div className="sm:w-1/2">
                <label htmlFor="num_occupants" className="block text-sm font-medium text-zinc-800 mb-1">
                  Number of adults moving in
                </label>
                <input
                  id="num_occupants"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 2"
                  value={numOccupants}
                  onChange={e => setNumOccupants(e.target.value)}
                  disabled={busy}
                  className={inputNormal}
                />
              </div>

              {/* Guarantor + Pets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-800 mb-2">Guarantor available?</p>
                  <RadioGroup
                    name="guarantor_available"
                    value={guarantorAvailable}
                    onChange={setGuarantorAvailable}
                    disabled={busy}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800 mb-2">Do you have pets?</p>
                  <RadioGroup
                    name="pets"
                    value={pets}
                    onChange={setPets}
                    disabled={busy}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'submitting' ? 'Submitting…' :
             status === 'qualifying' ? 'Analysing your enquiry…' :
             'Submit Enquiry'}
          </button>

          {serverError && (
            <p className="text-sm text-red-600 mt-2">{serverError}</p>
          )}
        </form>
      </div>
    </div>
  )
}
