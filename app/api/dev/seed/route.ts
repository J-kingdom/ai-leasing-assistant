import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const now = Date.now()
  const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString()

  const leads = [
    // ── High Intent ────────────────────────────────────────────────────────────
    {
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@example.com',
      phone: '07712 345678',
      message:
        "Hi, I'm looking for a 2-bedroom flat in Clapham or Brixton. My partner and I are both working in finance. Looking to move in around mid-June. Budget is up to £2,200 pcm.",
      raw_message: null,
      property_interest: '2-bed flat, Clapham or Brixton',
      budget: 2200,
      move_in_date: '2026-06-15',
      source: 'web_form',
      employment_status: 'employed',
      applicant_income: 4500,
      partner_income: 3500,
      num_occupants: 2,
      guarantor_available: false,
      pets: false,
      qualification_status: 'qualified',
      intent_status: 'high_intent',
      affordability_status: 'pass',
      qualification_score: 85,
      summary:
        'Professional couple with strong combined household income of £8,000 pcm seeking 2-bed in South London. Budget £2,200 pcm is well within affordability range (2.5× = £5,500 required). Clear timeline, references available.',
      qualification_notes:
        'Household income (£8,000 pcm) is 3.6× the rent — comfortably above the 2.5× threshold. Both employed, no pets, no guarantor needed. Move-in date confirmed. Low referencing risk.',
      missing_information: [],
      suggested_reply:
        "Dear Sarah, thank you for your enquiry. Your profile looks excellent — we have several 2-bedroom flats in Clapham and Brixton that match your budget and timeline. I'd love to arrange viewings at your convenience. Could you let me know which days work best over the next two weeks?",
      recommended_next_action: 'Schedule viewings for 2-bed flats in Clapham/Brixton — high-priority lead',
      created_at: daysAgo(9),
    },
    {
      name: 'James O\'Brien',
      email: 'james.obrien@example.com',
      phone: '07834 901234',
      message:
        "I'm an NHS nurse relocating to Manchester for a new post at MRI Hospital. Looking for a 1-bedroom apartment in the city centre — Northern Quarter or Ancoats preferred. Budget around £950 pcm, flexible by £50. Can move in from 1st June.",
      raw_message: null,
      property_interest: '1-bed flat, Northern Quarter or Ancoats',
      budget: 950,
      move_in_date: '2026-06-01',
      source: 'web_form',
      employment_status: 'employed',
      applicant_income: 2800,
      partner_income: null,
      num_occupants: 1,
      guarantor_available: false,
      pets: false,
      qualification_status: 'qualified',
      intent_status: 'high_intent',
      affordability_status: 'pass',
      qualification_score: 74,
      summary:
        'Relocating NHS professional seeking 1-bed in Manchester city centre. Monthly income of £2,800 pcm comfortably exceeds 2.5× rent requirement (£2,375). Clear budget and move-in date.',
      qualification_notes:
        'Income-to-rent ratio: £2,800 ÷ £950 = 2.95× — above threshold. Stable NHS employment. Flexible budget helps. Offer letter or contract needed for referencing.',
      missing_information: ['Employment contract or NHS offer letter for referencing'],
      suggested_reply:
        "Hi James, welcome to Manchester! We have a great selection of 1-bedroom apartments in the Northern Quarter and Ancoats within your budget. As an NHS worker you may be eligible for our key worker referral. I'll send over a shortlist — are you available for a video call or viewing before your move date?",
      recommended_next_action: 'Send property shortlist and request employment contract for referencing',
      created_at: daysAgo(6),
    },
    // ── Needs Info ─────────────────────────────────────────────────────────────
    {
      name: 'Amira Hassan',
      email: 'amira.hassan@example.com',
      phone: '07701 234567',
      message:
        "Hi, I'm looking for a 2-bedroom flat in Manchester, ideally close to the University of Manchester or in Fallowfield. I'm finishing my PhD in September and starting a lecturing position in October. Budget is £1,100 pcm and I'm happy to provide a guarantor if needed.",
      raw_message: null,
      property_interest: '2-bed flat, Fallowfield or near University of Manchester',
      budget: 1100,
      move_in_date: '2026-09-15',
      source: 'web_form',
      employment_status: 'student',
      applicant_income: null,
      partner_income: null,
      num_occupants: null,
      guarantor_available: true,
      pets: false,
      qualification_status: 'pending',
      intent_status: 'needs_info',
      affordability_status: 'maybe',
      qualification_score: 55,
      summary:
        'PhD student transitioning to lecturing role. Clear property need and location. Guarantor available, but income not yet stated — affordability unverifiable until salary confirmed.',
      qualification_notes:
        'Strong intent and specific requirements. Guarantor availability is positive. However, lecturing salary not provided — cannot confirm income ≥ 2.5× rent (£2,750 needed). Student status complicates referencing pre-employment.',
      missing_information: ['Confirmed starting salary for lecturing role', 'Guarantor details (name, income, address)'],
      suggested_reply:
        "Hi Amira, congratulations on your upcoming lecturing position! We have some great options in Fallowfield and near the University. To progress your application, could you share your confirmed starting salary and your guarantor's details? That will help us move quickly ahead of your September move-in.",
      recommended_next_action: 'Request confirmed salary and guarantor details before progressing viewings',
      created_at: daysAgo(3),
    },
    // ── Low Fit ────────────────────────────────────────────────────────────────
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: null,
      message:
        'Hello, I am thinking about maybe renting in Birmingham at some point. Not 100% sure yet but looking at options. Something nice would be great. Let me know what you have.',
      raw_message: null,
      property_interest: null,
      budget: null,
      move_in_date: null,
      source: 'web_form',
      employment_status: null,
      applicant_income: null,
      partner_income: null,
      num_occupants: null,
      guarantor_available: null,
      pets: null,
      qualification_status: 'unqualified',
      intent_status: 'low_fit',
      affordability_status: 'unknown',
      qualification_score: 18,
      summary:
        'Speculative enquiry with no specific requirements, budget, or timeline. Affordability cannot be assessed.',
      qualification_notes:
        'No budget, no income data, no move-in date, no property preference. Cannot determine affordability (unknown). Enquiry is casual browsing — not progessable without more information.',
      missing_information: ['Budget (pcm)', 'Move-in date', 'Property type and location', 'Employment and income details'],
      suggested_reply:
        "Hi Priya, thanks for reaching out! To help find the right property in Birmingham, it would be great to know your budget, when you'd like to move, and what type of property you're after. Feel free to reply or pop your details into our enquiry form.",
      recommended_next_action: 'Send brief needs-qualification email; follow up in 7 days if no response',
      created_at: daysAgo(4),
    },
    {
      name: 'Marcus Webb',
      email: 'marcus.webb@example.com',
      phone: '07956 123789',
      message:
        "Looking for a 3-bedroom house in Shoreditch or nearby for myself and two housemates. We're all freelancers working in creative industries. Budget about £1,400 per month. Would like to move in within 2 months.",
      raw_message: null,
      property_interest: '3-bed house, Shoreditch or East London',
      budget: 1400,
      move_in_date: '2026-07-11',
      source: 'web_form',
      employment_status: 'self_employed',
      applicant_income: null,
      partner_income: null,
      num_occupants: 3,
      guarantor_available: false,
      pets: false,
      qualification_status: 'unqualified',
      intent_status: 'low_fit',
      affordability_status: 'fail',
      qualification_score: 28,
      summary:
        'Group of freelancers seeking 3-bed in Shoreditch at a budget far below market rate. Affordability fails: income not provided, budget not viable for area, no guarantor.',
      qualification_notes:
        'Budget of £1,400 pcm is well below the Shoreditch 3-bed market (£3,000–£4,500+). Freelance income uncomfirmed — affordability marked fail due to clear budget mismatch and no guarantor. Would need 12 months accounts to reference. High risk.',
      missing_information: ['Freelance income proof (SA302 or 12 months bank statements)', 'Guarantor details', 'Realistic budget or alternative location'],
      suggested_reply:
        "Hi Marcus, thanks for your enquiry. I want to be upfront — a 3-bedroom property in Shoreditch at £1,400 pcm is very difficult as prices typically start from £2,800. We may be able to help with alternatives in nearby areas. As self-employed applicants, you'd also need 12 months of accounts or a guarantor. Would you like to explore other options?",
      recommended_next_action: 'Call to discuss budget gap and alternative East London areas; request income documentation',
      created_at: daysAgo(2),
    },
  ]

  const { error } = await supabase.from('leads').insert(leads)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ inserted: leads.length })
}
