// lib/diagnosis/types.ts
// Domain types for the V1 rules-based diagnosis engine.
// Application-layer types — separate from the raw DB row types in types/database.types.ts.

export type Urgency = 'low' | 'medium' | 'high'
export type SessionStatus = 'in_progress' | 'completed' | 'escalated' | 'abandoned'

// ---------------------------------------------------------------------------
// Catalogue types (read from DB, admin-managed)
// ---------------------------------------------------------------------------

export interface IssueCategory {
  id:          string
  label:       string
  description: string
  sort_order:  number
  is_active:   boolean
}

export interface DiagnosisOption {
  id:               string
  question_id:      string
  option_text:      string
  sort_order:       number
  next_question_id: string | null  // null = end of chain (V1: always null)
}

export interface DiagnosisQuestion {
  id:                string
  issue_category_id: string
  question_text:     string
  hint_text:         string | null
  sort_order:        number
  options:           DiagnosisOption[]  // hydrated by the repository join
}

/**
 * A single condition stored inside a diagnosis_outcomes.conditions JSONB array.
 * The outcome fires when all listed conditions are matched by the user's answers.
 * An empty conditions array means "always match" (fallback rule, confidence = 0.5).
 */
export interface OutcomeCondition {
  question_id: string  // UUID of the diagnosis_question
  option_id:   string  // UUID of the diagnosis_option that must be selected
}

export interface Part {
  id:          string
  name:        string
  part_number: string
  description: string | null
  price:       number
}

export interface DiagnosisOutcome {
  id:                 string
  issue_category_id:  string
  title:              string        // "Likely cause" headline
  description:        string        // fuller explanation
  recommended_action: string
  urgency:            Urgency
  conditions:         OutcomeCondition[]  // hydrated from JSONB in repository
  parts:              Part[]              // hydrated via outcome_parts join
}

// ---------------------------------------------------------------------------
// Engine types (pure computation layer — no I/O)
// ---------------------------------------------------------------------------

export interface SessionAnswer {
  question_id: string  // UUID of the question answered
  option_id:   string  // UUID of the selected option
}

export interface EngineInput {
  issue_category_id: string
  answers:           SessionAnswer[]
  outcomes:          DiagnosisOutcome[]  // all active outcomes for the category
}

export interface EngineResult {
  outcome:          DiagnosisOutcome
  confidence_score: number   // 0.0 – 1.0; base 0.5 for fallback rules
  is_escalated:     boolean  // true when score < CONFIDENCE_THRESHOLD
}

// ---------------------------------------------------------------------------
// Session types (DB-aligned)
// ---------------------------------------------------------------------------

export interface DiagnosisSession {
  id:                string
  user_id:           string
  machine_id:        string | null
  issue_category_id: string | null
  status:            SessionStatus
  outcome_id:        string | null
  confidence_score:  number | null
  created_at:        string
  completed_at:      string | null
}
