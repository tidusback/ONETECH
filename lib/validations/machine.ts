import { z } from 'zod'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const machineFormSchema = z.object({
  category:        z.string().min(1, 'Please select a machine type'),
  nickname:        z.string()
                    .min(2, 'Give your machine a name (at least 2 characters)')
                    .max(80, 'Name is too long'),
  model:           z.string().min(1, 'Please select or enter the machine model').max(150),
  serial_number:   z.string().min(1, 'Serial number is required').max(100),
  install_location:z.string().max(200).optional().or(z.literal('')),
  purchase_date:   z.string().optional().or(z.literal('')),
  warranty_status: z.enum(['under-warranty', 'out-of-warranty', 'unknown']),
  warranty_expiry: z.string().optional().or(z.literal('')),
  notes:           z.string().max(500, 'Notes must be under 500 characters').optional().or(z.literal('')),
})

export type MachineFormInput = z.infer<typeof machineFormSchema>

// ---------------------------------------------------------------------------
// Machine catalog — model lists grouped by category
// ---------------------------------------------------------------------------

export const MACHINE_CATALOG: Record<string, string[]> = {
  cnc: [
    'CNC Milling Machine',
    'CNC Lathe',
    'CNC Router',
    'CNC Plasma Cutter',
    '5-Axis Machining Center',
    'CNC Grinding Machine',
    'CNC Turning Center',
    'CNC EDM Machine',
  ],
  press: [
    'Hydraulic Press',
    'Pneumatic Press',
    'Punch Press',
    'Press Brake',
    'Die Casting Machine',
    'Injection Molding Machine',
    'Forging Press',
    'Stamping Press',
  ],
  welding: [
    'MIG Welder',
    'TIG Welder',
    'Arc Welder (Stick)',
    'Spot Welder',
    'Plasma Cutter',
    'Laser Welder',
    'Submerged Arc Welder',
    'Resistance Welder',
  ],
  compressor: [
    'Rotary Screw Air Compressor',
    'Piston Air Compressor',
    'Centrifugal Compressor',
    'Industrial Air Dryer',
    'Vacuum Pump',
    'Scroll Compressor',
    'Refrigerated Air Dryer',
  ],
  pump: [
    'Centrifugal Pump',
    'Submersible Pump',
    'Gear Pump',
    'Diaphragm Pump',
    'Peristaltic Pump',
    'Piston Pump',
    'Screw Pump',
    'Lobe Pump',
  ],
  generator: [
    'Diesel Generator',
    'Natural Gas Generator',
    'UPS System',
    'Voltage Stabilizer',
    'Automatic Transfer Switch',
  ],
  handling: [
    'Electric Forklift',
    'LPG Forklift',
    'Reach Truck',
    'Pallet Jack',
    'Belt Conveyor',
    'Roller Conveyor',
    'Overhead Crane',
    'Gantry Crane',
    'Scissor Lift',
  ],
  hvac: [
    'Industrial Chiller',
    'Cooling Tower',
    'Air Handling Unit',
    'Industrial Exhaust Fan',
    'Dehumidifier',
    'Industrial Air Conditioner',
    'Evaporative Cooler',
  ],
  other: [],
}

// ---------------------------------------------------------------------------
// Category display data (used in add form Step 1)
// ---------------------------------------------------------------------------

export interface MachineCategoryDef {
  id: string
  label: string
  description: string
}

export const MACHINE_CATEGORIES: MachineCategoryDef[] = [
  { id: 'cnc',        label: 'CNC & Machine Tools', description: 'CNC mills, lathes, routers'        },
  { id: 'press',      label: 'Presses & Stamping',  description: 'Hydraulic, pneumatic, punch presses' },
  { id: 'welding',    label: 'Welding Equipment',   description: 'MIG, TIG, arc, plasma cutters'     },
  { id: 'compressor', label: 'Compressors & Air',   description: 'Air compressors and dryers'        },
  { id: 'pump',       label: 'Pumps & Fluid',       description: 'Centrifugal, submersible pumps'    },
  { id: 'generator',  label: 'Generators & Power',  description: 'Diesel, gas generators, UPS'       },
  { id: 'handling',   label: 'Material Handling',   description: 'Forklifts, conveyors, cranes'      },
  { id: 'hvac',       label: 'HVAC & Cooling',      description: 'Chillers, cooling towers, fans'    },
  { id: 'other',      label: 'Other Equipment',     description: 'Anything not listed above'         },
]

// ---------------------------------------------------------------------------
// Warranty status display options
// ---------------------------------------------------------------------------

export const WARRANTY_OPTIONS = [
  {
    value: 'under-warranty'  as const,
    label: 'Still Under Warranty',
    description: 'The manufacturer warranty is active',
  },
  {
    value: 'out-of-warranty' as const,
    label: 'Warranty Has Expired',
    description: 'The warranty period has ended',
  },
  {
    value: 'unknown'         as const,
    label: "I'm Not Sure",
    description: "Don't know the warranty status",
  },
]
