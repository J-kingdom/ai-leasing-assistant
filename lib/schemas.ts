import { z } from 'zod'

export const InboundLeadSchema = z.object({
  name:             z.string().min(1),
  email:            z.string().email(),
  message:          z.string().min(1),
  phone:            z.string().nullable().optional().default(null),
  raw_message:      z.string().nullable().optional().default(null),
  property_interest: z.string().nullable().optional().default(null),
  budget:           z.number().nullable().optional().default(null),
  move_in_date:     z.string().nullable().optional().default(null),
  source:           z.string().nullable().optional().default(null),
  // Affordability fields
  employment_status:    z.string().nullable().optional().default(null),
  applicant_income:     z.number().int().nullable().optional().default(null),
  partner_income:       z.number().int().nullable().optional().default(null),
  num_occupants:        z.number().int().nullable().optional().default(null),
  guarantor_available:  z.boolean().nullable().optional().default(null),
  pets:                 z.boolean().nullable().optional().default(null),
})

export type InboundLeadInput = z.input<typeof InboundLeadSchema>
export type InboundLeadData  = z.output<typeof InboundLeadSchema>
