// lib/diagnosis/repository.ts
// All Supabase read/write operations for the diagnosis engine.
//
// Every function accepts a typed client rather than creating one internally,
// keeping them composable and testable without a real Supabase connection.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type {
  IssueCategory,
  DiagnosisQuestion,
  DiagnosisOption,
  DiagnosisOutcome,
  OutcomeCondition,
  Part,
  SessionAnswer,
  EngineResult,
} from './types'

type DbClient = SupabaseClient<Database>

// Lightweight error shape shared by all return values
type RepoError = { message: string }
type RepoResult<T> = Promise<{ data: T | null; error: RepoError | null }>

// ---------------------------------------------------------------------------
// Catalogue reads
// ---------------------------------------------------------------------------

export async function getIssueCategories(
  client: DbClient
): RepoResult<IssueCategory[]> {
  const { data, error } = await client
    .from('issue_categories')
    .select('id, label, description, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order')

  return { data: data ?? null, error }
}

/**
 * Returns the first active question for a category, with its options hydrated.
 * V1: one question per category. V2: replace with getNextQuestion(sessionId, optionId).
 */
export async function getQuestionForCategory(
  client: DbClient,
  categoryId: string
): RepoResult<DiagnosisQuestion> {
  const { data, error } = await client
    .from('diagnosis_questions')
    .select(`
      id, issue_category_id, question_text, hint_text, sort_order,
      options:diagnosis_options (id, question_id, option_text, sort_order, next_question_id)
    `)
    .eq('issue_category_id', categoryId)
    .eq('is_active', true)
    .order('sort_order')
    .limit(1)
    .maybeSingle()

  if (error) return { data: null, error }
  if (!data)  return { data: null, error: null }

  const question: DiagnosisQuestion = {
    id:                data.id,
    issue_category_id: data.issue_category_id,
    question_text:     data.question_text,
    hint_text:         data.hint_text,
    sort_order:        data.sort_order,
    options: ((data.options as unknown as DiagnosisOption[]) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  }

  return { data: question, error: null }
}

/**
 * Returns all active outcomes for a category, with their conditions (from JSONB)
 * and recommended parts (from the outcome_parts join) both hydrated.
 */
export async function getOutcomesWithParts(
  client: DbClient,
  categoryId: string
): RepoResult<DiagnosisOutcome[]> {
  const { data, error } = await client
    .from('diagnosis_outcomes')
    .select(`
      id, issue_category_id, title, description, recommended_action, urgency, conditions,
      outcome_parts (sort_order, parts (id, name, part_number, description, price))
    `)
    .eq('issue_category_id', categoryId)
    .eq('is_active', true)

  if (error) return { data: null, error }

  const outcomes: DiagnosisOutcome[] = (data ?? []).map((row) => {
    // Flatten the outcome_parts → parts join and sort by sort_order
    const parts: Part[] = ((row.outcome_parts as unknown as Array<{
      sort_order: number
      parts: Part | null
    }>) ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((op) => op.parts)
      .filter((p): p is Part => p !== null)

    return {
      id:                 row.id,
      issue_category_id:  row.issue_category_id,
      title:              row.title,
      description:        row.description,
      recommended_action: row.recommended_action,
      urgency:            row.urgency as DiagnosisOutcome['urgency'],
      conditions:         (row.conditions as unknown as OutcomeCondition[]) ?? [],
      parts,
    }
  })

  return { data: outcomes, error: null }
}

// ---------------------------------------------------------------------------
// Session writes
// ---------------------------------------------------------------------------

export async function createSession(
  client: DbClient,
  userId: string,
  params: { machine_id?: string | null; issue_category_id?: string | null }
): RepoResult<{ id: string }> {
  const { data, error } = await client
    .from('diagnosis_sessions')
    .insert({
      user_id:           userId,
      machine_id:        params.machine_id        ?? null,
      issue_category_id: params.issue_category_id ?? null,
      status:            'in_progress',
    })
    .select('id')
    .single()

  return { data: data ?? null, error }
}

/**
 * Upserts a single answer. The UNIQUE (session_id, question_id) constraint
 * means calling this twice for the same question replaces the earlier answer —
 * this is the intended behaviour for "go back and change your mind".
 */
export async function upsertAnswer(
  client: DbClient,
  sessionId: string,
  answer: SessionAnswer
): Promise<{ error: RepoError | null }> {
  const { error } = await client
    .from('diagnosis_answers')
    .upsert(
      {
        session_id:  sessionId,
        question_id: answer.question_id,
        option_id:   answer.option_id,
      },
      { onConflict: 'session_id,question_id' }
    )

  return { error: error ?? null }
}

export async function getSessionAnswers(
  client: DbClient,
  sessionId: string
): RepoResult<SessionAnswer[]> {
  const { data, error } = await client
    .from('diagnosis_answers')
    .select('question_id, option_id')
    .eq('session_id', sessionId)

  if (error) return { data: null, error }

  return {
    data: (data ?? []).map((row) => ({
      question_id: row.question_id,
      option_id:   row.option_id,
    })),
    error: null,
  }
}

/**
 * Writes the engine result back to the session row, marking it completed or escalated.
 */
export async function resolveSession(
  client: DbClient,
  sessionId: string,
  result: EngineResult
): Promise<{ error: RepoError | null }> {
  const { error } = await client
    .from('diagnosis_sessions')
    .update({
      status:           result.is_escalated ? 'escalated' : 'completed',
      outcome_id:       result.outcome.id,
      confidence_score: result.confidence_score,
      completed_at:     new Date().toISOString(),
    })
    .eq('id', sessionId)

  return { error: error ?? null }
}

export async function escalateSession(
  client: DbClient,
  sessionId: string
): Promise<{ error: RepoError | null }> {
  const { error } = await client
    .from('diagnosis_sessions')
    .update({
      status:       'escalated',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  return { error: error ?? null }
}
