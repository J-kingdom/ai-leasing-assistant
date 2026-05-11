import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const now = Date.now()
  const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString()

  const leads = [
    // ── Qualified ──────────────────────────────────────────────────────────────
    {
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@example.com',
      phone: '07712 345678',
      message:
        "Hi, I'm looking for a 2-bedroom flat in Clapham or Brixton. My partner and I are both working in finance with a combined income of around £95,000. We can provide references from our current landlord and employer. Looking to move in around mid-June. Budget is up to £2,200 pcm.",
      raw_message: null,
      property_interest: '2-bed flat, Clapham or Brixton',
      budget: 2200,
      move_in_date: '2026-06-15',
      source: 'web_form',
      qualification_status: 'qualified',
      qualification_score: 82,
      summary:
        'Professional couple with strong combined income seeking 2-bed in South London. Clear budget, confirmed timeline, and references available.',
      qualification_notes:
        'High-intent lead. Combined income well above typical 30× rent threshold. References available, move-in date confirmed. Low referencing risk.',
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
        "I'm an NHS nurse relocating to Manchester for a new post at MRI Hospital. Looking for a 1-bedroom apartment in the city centre — Northern Quarter or Ancoats preferred. Budget around £950 pcm, flexible by £50 or so. Can move in from 1st June.",
      raw_message: null,
      property_interest: '1-bed flat, Northern Quarter or Ancoats',
      budget: 950,
      move_in_date: '2026-06-01',
      source: 'web_form',
      qualification_status: 'qualified',
      qualification_score: 71,
      summary:
        'Relocating NHS professional seeking 1-bed in Manchester city centre. Clear budget and move-in date, stable public sector employment.',
      qualification_notes:
        'Good intent with confirmed employment. NHS salary typically meets affordability at this rent level. Flexible on exact budget by £50.',
      missing_information: ['Employment contract or offer letter for referencing'],
      suggested_reply:
        "Hi James, welcome to Manchester! We have a great selection of 1-bedroom apartments in the Northern Quarter and Ancoats within your budget. As an NHS worker you may also be eligible for our key worker referral. I'll send over a shortlist — are you available for a video call or viewing before your move date?",
      recommended_next_action: 'Send property shortlist and request employment contract for referencing',
      created_at: daysAgo(6),
    },
    // ── Unqualified ────────────────────────────────────────────────────────────
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
      qualification_status: 'unqualified',
      qualification_score: 22,
      summary:
        'Speculative enquiry with no specific requirements, budget, or timeline. Low intent signal at this stage.',
      qualification_notes:
        'No budget, no move-in date, no property preference stated. Enquiry is exploratory. May be early in the search journey but cannot be progressed without more information.',
      missing_information: ['Budget (pcm)', 'Move-in date', 'Property type and location preference', 'Employment or income details'],
      suggested_reply:
        "Hi Priya, thanks for reaching out! To help find the right property in Birmingham, it would be great to know a bit more — roughly what budget you have in mind, when you'd be looking to move, and what type of property you're after. Feel free to reply or give us a call.",
      recommended_next_action: 'Send needs-qualification questionnaire; follow up in 5 days if no response',
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
      qualification_status: 'unqualified',
      qualification_score: 35,
      summary:
        'Group of freelancers seeking 3-bed in Shoreditch at a budget significantly below market rate. Affordability and referencing present high risk.',
      qualification_notes:
        'Budget of £1,400 pcm is well below the Shoreditch market for a 3-bed (typically £3,000–£4,500+). Freelance income complicates referencing without 12 months of accounts. High risk of application failure without guarantors or budget flexibility.',
      missing_information: ['Proof of freelance income (SA302 or 12 months bank statements)', 'Guarantor details', 'Willingness to increase budget or adjust location'],
      suggested_reply:
        "Hi Marcus, thanks for your enquiry. I want to be transparent — a 3-bedroom property in Shoreditch at £1,400 pcm will be very difficult, as prices typically start from £2,800. We may be able to help with options in nearby areas at your budget. As freelancers, you'd also need to provide 12 months of accounts or a guarantor. Would you like to explore alternatives?",
      recommended_next_action: 'Call to discuss budget gap and alternative East London areas; request income documentation',
      created_at: daysAgo(2),
    },
    // ── Pending ────────────────────────────────────────────────────────────────
    {
      name: 'Amira Hassan',
      email: 'amira.hassan@example.com',
      phone: '07701 234567',
      message:
        "Hi, I'm looking for a 2-bedroom flat in Manchester, ideally close to the University of Manchester or in Fallowfield. I'm finishing my PhD in September and starting a lecturing position at the university in October. Budget is £1,100 pcm and I'm happy to provide a guarantor if needed.",
      raw_message: null,
      property_interest: '2-bed flat, Fallowfield or near University of Manchester',
      budget: 1100,
      move_in_date: '2026-09-15',
      source: 'web_form',
      qualification_status: 'pending',
      qualification_score: null,
      summary: null,
      qualification_notes: null,
      missing_information: null,
      suggested_reply: null,
      recommended_next_action: null,
      created_at: daysAgo(0),
    },
  ]

  const { error } = await supabase.from('leads').insert(leads)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ inserted: leads.length })
}
