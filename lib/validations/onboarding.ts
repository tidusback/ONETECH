import { z } from 'zod'

// ---------------------------------------------------------------------------
// Customer onboarding schema (unchanged)
// ---------------------------------------------------------------------------

export const customerOnboardingSchema = z.object({
  full_name: z.string().min(2, 'Please enter your full name').max(100),
  experience: z.enum(['beginner', 'intermediate', 'professional'], {
    required_error: 'Please select your experience level',
  }),
  company: z
    .string()
    .max(120, 'Company name is too long')
    .optional()
    .or(z.literal('')),
})

export type CustomerOnboardingInput = z.infer<typeof customerOnboardingSchema>

// ---------------------------------------------------------------------------
// Technician application — per-step schemas for incremental validation
// ---------------------------------------------------------------------------

export const techAppStep1Schema = z.object({
  full_name: z.string().min(2, 'Please enter your full name').max(100),
  phone: z
    .string()
    .regex(/^[+\d\s\-()]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional().or(z.literal('')),
})

export const techAppStep2Schema = z.object({
  city: z.string().min(2, 'City is required').max(100),
  province: z.string().min(2, 'Province is required').max(100),
  service_radius_km: z.coerce.number().int().min(10).max(9999).default(50),
})

export const techAppStep3Schema = z.object({
  years_experience: z.coerce
    .number({ invalid_type_error: 'Enter years of experience' })
    .int()
    .min(0, 'Must be 0 or more')
    .max(60, 'Must be 60 or less'),
  departments: z.array(z.string()).min(1, 'Select at least one department'),
  machine_categories: z.array(z.string()).min(1, 'Select at least one category'),
})

export const techAppStep4Schema = z.object({
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
})

export const techAppStep5Schema = z.object({
  agreed_to_terms: z
    .boolean()
    .refine((v) => v === true, 'You must acknowledge the terms to proceed'),
})

// Combined schema for final submission
export const technicianApplicationSchema = techAppStep1Schema
  .merge(techAppStep2Schema)
  .merge(techAppStep3Schema)
  .merge(techAppStep4Schema)
  .merge(techAppStep5Schema)

export type TechnicianApplicationInput = z.infer<typeof technicianApplicationSchema>

// ---------------------------------------------------------------------------
// Step field maps — used by form to trigger per-step validation
// ---------------------------------------------------------------------------

export const TECH_APP_STEP_FIELDS: Record<
  1 | 2 | 3 | 4 | 5,
  (keyof TechnicianApplicationInput)[]
> = {
  1: ['full_name', 'phone', 'bio'],
  2: ['city', 'province', 'service_radius_km'],
  3: ['years_experience', 'departments', 'machine_categories'],
  4: ['skills'],
  5: ['agreed_to_terms'],
}

// ---------------------------------------------------------------------------
// Option arrays
// ---------------------------------------------------------------------------

export const experienceOptions: Array<{
  value: CustomerOnboardingInput['experience']
  label: string
  description: string
}> = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'Just starting out — less than 1 year working with industrial equipment',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: '1 to 5 years managing or operating industrial machinery',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: '5+ years, plant manager or experienced operations professional',
  },
]

export const departmentOptions: Array<{
  value: string
  label: string
  description: string
}> = [
  {
    value: 'field_service',
    label: 'Field Service',
    description: 'On-site maintenance, breakdowns, and commissioning',
  },
  {
    value: 'workshop',
    label: 'Workshop',
    description: 'In-house repairs, overhauls, and bench testing',
  },
  {
    value: 'electrical',
    label: 'Electrical & Controls',
    description: 'Electrical systems, PLCs, drives, and instrumentation',
  },
  {
    value: 'mechanical',
    label: 'Mechanical',
    description: 'Mechanical components, hydraulics, and pneumatics',
  },
  {
    value: 'parts_supply',
    label: 'Parts & Supply',
    description: 'Spare parts procurement, inventory, and logistics',
  },
]

export const SA_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Free State',
]

export const SERVICE_RADIUS_OPTIONS = [
  { value: 25,   label: '25 km' },
  { value: 50,   label: '50 km' },
  { value: 100,  label: '100 km' },
  { value: 150,  label: '150 km' },
  { value: 200,  label: '200 km' },
  { value: 9999, label: 'Nationwide' },
]

export const MACHINE_CATEGORY_OPTIONS = [
  { value: 'CNC',        label: 'CNC Machines' },
  { value: 'Press',      label: 'Press & Stamping' },
  { value: 'Welding',    label: 'Welding Equipment' },
  { value: 'Compressor', label: 'Compressors' },
  { value: 'Pump',       label: 'Pumps & Fluid Systems' },
  { value: 'Generator',  label: 'Generators & Power' },
  { value: 'Handling',   label: 'Material Handling' },
  { value: 'HVAC',       label: 'HVAC & Refrigeration' },
  { value: 'Other',      label: 'Other Equipment' },
]

export const TECHNICIAN_SKILLS = [
  'Electrical Wiring & Panels',
  'Hydraulic Systems',
  'Pneumatic Systems',
  'CNC Programming & Operation',
  'PLC / Automation (Siemens)',
  'PLC / Automation (Allen-Bradley)',
  'MIG / TIG / Arc Welding',
  'Mechanical Assembly',
  'Fault Finding & Diagnostics',
  'Preventive Maintenance',
  'HVAC & Refrigeration',
  'Compressor Servicing',
  'Pump & Valve Servicing',
  'VFD & Motor Drives',
  'Instrumentation & Sensors',
  'Rigging & Lifting Equipment',
  'Hydraulic Press Tooling',
  'Blueprint & Technical Drawing',
  'OHS / Safety Compliance',
  'Machine Commissioning',
]

// Status display config
export const APPLICATION_STATUS_CONFIG: Record<
  'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info',
  { label: string; color: string; description: string }
> = {
  pending: {
    label: 'Pending Review',
    color: 'text-amber-500',
    description: 'Your application has been received and is awaiting review.',
  },
  under_review: {
    label: 'Under Review',
    color: 'text-blue-500',
    description: 'Our team is currently reviewing your application.',
  },
  approved: {
    label: 'Approved',
    color: 'text-emerald-500',
    description: 'Your application has been approved. Welcome to the team!',
  },
  rejected: {
    label: 'Not Approved',
    color: 'text-destructive',
    description: 'Your application was not approved at this time.',
  },
  requires_info: {
    label: 'More Info Needed',
    color: 'text-orange-500',
    description: 'We need additional information to process your application.',
  },
}
