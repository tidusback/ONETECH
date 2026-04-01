// lib/diagnosis/engine.ts
// Pure rules-matching logic for the diagnosis engine.
// No I/O, no side effects — safe to import and test in isolation.

import type {
  DiagnosisOutcome,
  OutcomeCondition,
  SessionAnswer,
  EngineInput,
  EngineResult,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Minimum confidence score at or above which a diagnosis is considered reliable.
 * Sessions where the best match falls below this threshold are flagged for
 * escalation to a human technician.
 *
 * V1: stored as a constant. If per-category thresholds are needed later,
 * add a `confidence_threshold` column to issue_categories.
 */
export const CONFIDENCE_THRESHOLD = 0.6

/**
 * Confidence assigned to outcomes with no conditions (catch-all / fallback rules).
 * These always match, but deliberately sit below CONFIDENCE_THRESHOLD so
 * specific-answer rules (score 1.0) are always preferred.
 */
export const BASE_CONFIDENCE = 0.5

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the given condition is satisfied by at least one answer
 * in the provided array.
 */
export function conditionMatches(
  condition: OutcomeCondition,
  answers: SessionAnswer[]
): boolean {
  return answers.some(
    (a) =>
      a.question_id === condition.question_id &&
      a.option_id   === condition.option_id
  )
}

/**
 * Scores a single outcome against the user's answers.
 *
 * Scoring rules:
 *   - Empty conditions  → BASE_CONFIDENCE (0.5). Catch-all / fallback rule.
 *   - Non-empty         → matched_conditions / total_conditions (0.0 – 1.0).
 *     A perfect match (all conditions satisfied) scores 1.0.
 *     A partial match scores proportionally.
 *     No match at all scores 0.0.
 */
export function scoreOutcome(
  outcome: DiagnosisOutcome,
  answers: SessionAnswer[]
): number {
  if (outcome.conditions.length === 0) return BASE_CONFIDENCE

  const matched = outcome.conditions.filter((c) => conditionMatches(c, answers)).length
  return matched / outcome.conditions.length
}

// ---------------------------------------------------------------------------
// Main engine entry point
// ---------------------------------------------------------------------------

/**
 * Runs all outcomes through the scorer and returns the best-matching one.
 *
 * Tie-breaking (in priority order):
 *   1. Highest confidence score wins.
 *   2. When scores are equal, prefer the outcome with more conditions
 *      (more specific rule beats a less specific one).
 *   3. When still tied, the first outcome in the list wins (stable sort).
 *
 * Sets is_escalated = true when best.confidence < CONFIDENCE_THRESHOLD,
 * signalling that no specific rule matched well enough and a human technician
 * should review the case.
 *
 * Throws if outcomes is empty — callers must ensure at least a fallback
 * outcome exists for every category (guaranteed by the seed data).
 */
export function runEngine(input: EngineInput): EngineResult {
  if (input.outcomes.length === 0) {
    throw new Error(
      `runEngine: no outcomes configured for category "${input.issue_category_id}"`
    )
  }

  const scored = input.outcomes
    .map((outcome) => ({
      outcome,
      confidence_score: scoreOutcome(outcome, input.answers),
    }))
    .sort((a, b) => {
      // Primary: confidence descending
      if (b.confidence_score !== a.confidence_score) {
        return b.confidence_score - a.confidence_score
      }
      // Tiebreak: more conditions = more specific = wins
      return b.outcome.conditions.length - a.outcome.conditions.length
    })

  const best = scored[0]

  return {
    outcome:          best.outcome,
    confidence_score: best.confidence_score,
    is_escalated:     best.confidence_score < CONFIDENCE_THRESHOLD,
  }
}
