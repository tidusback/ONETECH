'use server'
// lib/diagnosis/actions.ts
// Server actions for the diagnosis wizard.
// Orchestrates the repository (DB) and engine (pure logic) layers.
// Returns ActionResult<T> consistently with the rest of the codebase.

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'
import type { DiagnosisQuestion, EngineResult, IssueCategory } from './types'
import { runEngine } from './engine'
import * as repo from './repository'

// ---------------------------------------------------------------------------
// Catalogue reads
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<ActionResult<{ categories: IssueCategory[] }>> {
  const supabase = await createClient()
  const { data, error } = await repo.getIssueCategories(supabase)
  if (error || !data) {
    return { success: false, error: error?.message ?? 'Failed to load categories' }
  }
  return { success: true, data: { categories: data } }
}

// ---------------------------------------------------------------------------
// Session lifecycle
// ---------------------------------------------------------------------------

/**
 * Called when the user lands on the support flow (step 1 → step 2).
 * Creates a fresh session row and returns its ID for all subsequent calls.
 */
export async function startDiagnosisSession(
  machineId?: string
): Promise<ActionResult<{ sessionId: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await repo.createSession(supabase, user.id, {
    machine_id: machineId ?? null,
  })

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Failed to create session' }
  }

  return { success: true, data: { sessionId: data.id } }
}

// ---------------------------------------------------------------------------
// Category selection
// ---------------------------------------------------------------------------

/**
 * Called when the user selects an issue category (step 3).
 * Stamps the category onto the session and returns the question for that category.
 */
export async function selectCategory(
  sessionId: string,
  categoryId: string
): Promise<ActionResult<{ question: DiagnosisQuestion }>> {
  const supabase = await createClient()

  // Stamp category on session
  const { error: updateError } = await supabase
    .from('diagnosis_sessions')
    .update({ issue_category_id: categoryId })
    .eq('id', sessionId)

  if (updateError) return { success: false, error: updateError.message }

  // Fetch the guided question for this category
  const { data: question, error: qError } = await repo.getQuestionForCategory(
    supabase,
    categoryId
  )

  if (qError)    return { success: false, error: qError.message }
  if (!question) return { success: false, error: 'No question found for this category' }

  return { success: true, data: { question } }
}

// ---------------------------------------------------------------------------
// Answer submission
// ---------------------------------------------------------------------------

/**
 * Called when the user selects an option on the guided question (step 4).
 * Persists the answer and returns the next question to display.
 *
 * V1: single question per category — nextQuestion is always null.
 * V2 hook: resolve option.next_question_id and return that question.
 */
export async function submitAnswer(
  sessionId: string,
  questionId: string,
  optionId: string
): Promise<ActionResult<{ nextQuestion: DiagnosisQuestion | null }>> {
  const supabase = await createClient()

  const { error } = await repo.upsertAnswer(supabase, sessionId, {
    question_id: questionId,
    option_id:   optionId,
  })

  if (error) return { success: false, error: error.message }

  // V1: no branching — always proceed to the next wizard step
  return { success: true, data: { nextQuestion: null } }
}

// ---------------------------------------------------------------------------
// Diagnosis computation
// ---------------------------------------------------------------------------

/**
 * Called when the user reaches the diagnosis step (step 6).
 * Loads all answers, fetches outcomes, runs the engine, persists the result,
 * and returns the full EngineResult.
 */
export async function runDiagnosis(
  sessionId: string
): Promise<ActionResult<{ result: EngineResult }>> {
  const supabase = await createClient()

  // Load the session to get the category
  const { data: session, error: sessionError } = await supabase
    .from('diagnosis_sessions')
    .select('issue_category_id')
    .eq('id', sessionId)
    .single()

  if (sessionError) return { success: false, error: sessionError.message }
  if (!session?.issue_category_id) {
    return { success: false, error: 'Session has no category — call selectCategory first' }
  }

  // Fetch answers and outcomes in parallel
  const [answersResult, outcomesResult] = await Promise.all([
    repo.getSessionAnswers(supabase, sessionId),
    repo.getOutcomesWithParts(supabase, session.issue_category_id),
  ])

  if (answersResult.error)  return { success: false, error: answersResult.error.message }
  if (outcomesResult.error) return { success: false, error: outcomesResult.error.message }

  const answers  = answersResult.data  ?? []
  const outcomes = outcomesResult.data ?? []

  if (outcomes.length === 0) {
    return { success: false, error: 'No outcomes configured for this category' }
  }

  // Run the pure engine
  const result = runEngine({
    issue_category_id: session.issue_category_id,
    answers,
    outcomes,
  })

  // Persist outcome + confidence back to the session
  const { error: resolveError } = await repo.resolveSession(supabase, sessionId, result)
  if (resolveError) return { success: false, error: resolveError.message }

  return { success: true, data: { result } }
}

// ---------------------------------------------------------------------------
// Escalation
// ---------------------------------------------------------------------------

/**
 * Called when the engine confidence is too low or the user manually requests
 * a technician visit.
 *
 * Marks the session as escalated.
 * TODO: wire to create a support_tickets row once that table is defined.
 */
export async function escalateToDiagnosis(
  sessionId:       string,
  _machineId:      string,
  _description:    string,
  _attachmentPaths: string[] = []
  // TODO: store _attachmentPaths in a support_tickets row once that table is wired
): Promise<ActionResult<{ ticketNumber: string }>> {
  const supabase = await createClient()

  const { error } = await repo.escalateSession(supabase, sessionId)
  if (error) return { success: false, error: error.message }

  // Stub ticket number until support_tickets table is wired
  const ticketNumber = `TKT-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`

  return { success: true, data: { ticketNumber } }
}

// ---------------------------------------------------------------------------
// Result read-back
// ---------------------------------------------------------------------------

/**
 * Returns the computed result for a session that has already been resolved.
 * Used to render the diagnosis result after a page reload.
 */
export async function getDiagnosisResult(
  sessionId: string
): Promise<ActionResult<{ result: EngineResult }>> {
  const supabase = await createClient()

  // Load session fields
  const { data: session, error: sessionError } = await supabase
    .from('diagnosis_sessions')
    .select('issue_category_id, outcome_id, confidence_score, status')
    .eq('id', sessionId)
    .single()

  if (sessionError) return { success: false, error: sessionError.message }
  if (!session?.outcome_id) {
    return { success: false, error: 'No result available — call runDiagnosis first' }
  }

  // Re-fetch outcome with parts to reconstruct the EngineResult
  const { data: outcomes, error: outcomesError } = await repo.getOutcomesWithParts(
    supabase,
    session.issue_category_id!
  )

  if (outcomesError) return { success: false, error: outcomesError.message }

  const outcome = (outcomes ?? []).find((o) => o.id === session.outcome_id)
  if (!outcome) return { success: false, error: 'Outcome not found' }

  return {
    success: true,
    data: {
      result: {
        outcome,
        confidence_score: session.confidence_score ?? 0,
        is_escalated:     session.status === 'escalated',
      },
    },
  }
}
