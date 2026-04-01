// Support flow data — issue categories and guided questions for the diagnosis wizard

export interface IssueCategory {
  id:          string
  label:       string
  description: string
}

export interface GuidedQuestion {
  question: string
  options:  readonly string[]
}

export const ISSUE_CATEGORIES: IssueCategory[] = [
  { id: 'power',       label: "Won't start",       description: "Machine doesn't power on or turn off normally" },
  { id: 'noise',       label: 'Strange noise',      description: 'Unusual grinding, knocking, or squealing'      },
  { id: 'heat',        label: 'Overheating',         description: 'Machine gets too hot during operation'          },
  { id: 'leak',        label: 'Leaking',             description: 'Oil, water, or other fluid leaking out'         },
  { id: 'vibration',   label: 'Vibrating badly',     description: 'Excessive shaking or instability'               },
  { id: 'performance', label: 'Poor performance',    description: 'Slow output, reduced quality, or low power'     },
  { id: 'error',       label: 'Error code / alarm',  description: 'Warning light, alarm, or error code showing'    },
  { id: 'other',       label: 'Something else',      description: 'Describe the problem in your own words'         },
]

export const GUIDED_QUESTIONS: Record<string, GuidedQuestion> = {
  power: {
    question: 'When did this start?',
    options:  ['Just now', 'A few days ago', 'About a week ago', 'It never worked right'],
  },
  noise: {
    question: 'What does the noise sound like?',
    options:  ['Grinding / scraping', 'Knocking / banging', 'High-pitched squeal', 'Rattling / vibration'],
  },
  heat: {
    question: 'When does it overheat?',
    options:  ['Straight after starting', 'After running a while', 'Only under heavy load', 'Randomly / no pattern'],
  },
  leak: {
    question: 'What is leaking?',
    options:  ['Oil or lubricant', 'Water or coolant', 'Air or gas', 'Not sure'],
  },
  vibration: {
    question: 'How severe is the vibration?',
    options:  ['Slight — barely noticeable', 'Moderate — affects work', 'Severe — hard to operate', 'Only at certain speeds'],
  },
  performance: {
    question: 'How long has performance been affected?',
    options:  ['Just today', 'A few days', 'A week or more', 'Gradually getting worse'],
  },
  error: {
    question: 'What are you seeing on the machine?',
    options:  ['Error code on display', 'Alarm sound only', 'Warning light is on', 'Multiple warnings at once'],
  },
  other: {
    question: 'How urgent is this for you?',
    options:  ['Critical — machine is stopped', 'High — production affected', 'Medium — can still work', 'Low — just want it checked'],
  },
}

export interface DiagnosisResult {
  likely:  string
  urgency: 'low' | 'medium' | 'high'
  action:  string
}

export const DIAGNOSIS_BY_ISSUE: Record<string, DiagnosisResult> = {
  power:       { likely: 'Faulty start capacitor or power relay',        urgency: 'high',   action: 'A technician visit is recommended to inspect the electrical system safely.' },
  noise:       { likely: 'Worn bearing or loose internal component',     urgency: 'medium', action: 'Schedule a service visit before the issue worsens or causes damage.'         },
  heat:        { likely: 'Blocked air vents or failing cooling system',  urgency: 'high',   action: 'Stop using the machine until inspected to prevent further damage.'           },
  leak:        { likely: 'Degraded seal or cracked hose',                urgency: 'medium', action: 'Replace the affected seal or hose as soon as possible.'                     },
  vibration:   { likely: 'Imbalanced component or loose mounting',       urgency: 'medium', action: 'Tighten all mounting bolts and check for worn rotating components.'          },
  performance: { likely: 'Clogged filter or calibration drift',          urgency: 'low',    action: 'Clean or replace filters and run a full calibration check.'                  },
  error:       { likely: 'Sensor fault or software error',               urgency: 'medium', action: 'Note the exact error code and escalate to our support team for diagnosis.'   },
  other:       { likely: 'Requires manual inspection by a technician',   urgency: 'low',    action: 'Our team will review your report and contact you to arrange an inspection.'  },
}
