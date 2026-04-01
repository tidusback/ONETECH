'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Wrench, ArrowLeft, ArrowRight, CheckCircle2,
  Power, Volume2, Thermometer, Droplets,
  Activity, TrendingDown, AlertTriangle, HelpCircle,
  Plus,
  Cpu, Gauge, Flame, Wind, Zap, Truck,
  Package, LifeBuoy, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  getCategories,
  startDiagnosisSession,
  selectCategory,
  submitAnswer,
  runDiagnosis,
  escalateToDiagnosis,
} from '@/lib/diagnosis/actions'
import type { IssueCategory, DiagnosisQuestion, EngineResult } from '@/lib/diagnosis/types'
import { FileUploadZone } from './file-upload-zone'

// ---------------------------------------------------------------------------
// Placeholder machines — replace with real user-machines query when that
// table lands. The shape matches what selectCategory / startDiagnosisSession need.
// ---------------------------------------------------------------------------

// Placeholder UUIDs — valid UUID format so they satisfy the machine_id UUID column in DB.
// Replace with a real user-machines query once that table lands.
const PLACEHOLDER_MACHINES = [
  { id: 'a0000000-0000-0000-0000-000000000001', nickname: 'Floor Press #2',      category: 'press',      model: 'Baileigh BP-90-AS' },
  { id: 'a0000000-0000-0000-0000-000000000002', nickname: 'Workshop Compressor', category: 'compressor', model: 'Atlas Copco GA 15' },
  { id: 'a0000000-0000-0000-0000-000000000003', nickname: 'CNC Lathe',           category: 'cnc',        model: 'Haas ST-10'        },
]

// ---------------------------------------------------------------------------
// Icon maps
// ---------------------------------------------------------------------------

const ISSUE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  power:       Power,
  noise:       Volume2,
  heat:        Thermometer,
  leak:        Droplets,
  vibration:   Activity,
  performance: TrendingDown,
  error:       AlertTriangle,
  other:       HelpCircle,
}

// Map DB label → icon key (lower-cased first word or keyword match)
function iconKeyForCategory(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('start') || l.includes('power'))       return 'power'
  if (l.includes('noise') || l.includes('sound'))       return 'noise'
  if (l.includes('heat') || l.includes('overheat'))     return 'heat'
  if (l.includes('leak'))                               return 'leak'
  if (l.includes('vibrat'))                             return 'vibration'
  if (l.includes('performance') || l.includes('slow'))  return 'performance'
  if (l.includes('error') || l.includes('alarm'))       return 'error'
  return 'other'
}

const MACHINE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cnc:        Cpu,
  press:      Gauge,
  welding:    Flame,
  compressor: Wind,
  pump:       Droplets,
  generator:  Zap,
  handling:   Truck,
  hvac:       Thermometer,
  other:      HelpCircle,
}

const URGENCY_CONFIG = {
  low:    { label: 'Low priority',    variant: 'neutral'     as const },
  medium: { label: 'Needs attention', variant: 'warning'     as const },
  high:   { label: 'Act soon',        variant: 'destructive' as const },
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

const FLOW_STEPS = 7

function ProgressBar({ step }: { step: number }) {
  if (step > FLOW_STEPS) return null
  const pct = Math.round(((step - 1) / (FLOW_STEPS - 1)) * 100)
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Step {step} of {FLOW_STEPS}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-1 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SupportFlow() {
  const router = useRouter()

  const [step,              setStep]              = useState(1)
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null)
  const [selectedCategoryId,setSelectedCategoryId]= useState<string | null>(null)
  const [uploadedPaths,     setUploadedPaths]     = useState<string[]>([])
  const [isUploading,       setIsUploading]       = useState(false)
  const [addedParts,        setAddedParts]        = useState<Set<string>>(new Set())

  // Engine state
  const [sessionId,         setSessionId]         = useState<string | null>(null)
  const [categories,        setCategories]        = useState<IssueCategory[]>([])
  const [currentQuestion,   setCurrentQuestion]   = useState<DiagnosisQuestion | null>(null)
  const [selectedOptionId,  setSelectedOptionId]  = useState<string | null>(null)
  const [engineResult,      setEngineResult]      = useState<EngineResult | null>(null)
  const [ticketNumber,      setTicketNumber]      = useState<string | null>(null)

  // Async status
  const [isLoading,         setIsLoading]         = useState(false)
  const [errorMsg,          setErrorMsg]          = useState<string | null>(null)

  // Derived
  const selectedMachine  = PLACEHOLDER_MACHINES.find((m) => m.id === selectedMachineId)
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  // Load categories on mount
  useEffect(() => {
    getCategories().then((res) => {
      if (res.success) setCategories(res.data.categories)
    })
  }, [])

  // ---------------------------------------------------------------------------
  // Step transition helpers
  // ---------------------------------------------------------------------------

  function next() { setErrorMsg(null); setStep((s) => s + 1) }
  function back() { setErrorMsg(null); setStep((s) => s - 1) }

  async function handleMachineSelect(machineId: string) {
    setSelectedMachineId(machineId)
    setIsLoading(true)
    setErrorMsg(null)
    const res = await startDiagnosisSession(machineId)
    setIsLoading(false)
    if (!res.success) { setErrorMsg(res.error); return }
    setSessionId(res.data.sessionId)
    next()
  }

  async function handleCategorySelect(categoryId: string) {
    if (!sessionId) return
    setSelectedCategoryId(categoryId)
    setIsLoading(true)
    setErrorMsg(null)
    const res = await selectCategory(sessionId, categoryId)
    setIsLoading(false)
    if (!res.success) { setErrorMsg(res.error); return }
    setCurrentQuestion(res.data.question)
    next()
  }

  async function handleOptionSelect(optionId: string) {
    if (!sessionId || !currentQuestion) return
    setSelectedOptionId(optionId)
    setIsLoading(true)
    setErrorMsg(null)
    const res = await submitAnswer(sessionId, currentQuestion.id, optionId)
    setIsLoading(false)
    if (!res.success) { setErrorMsg(res.error); return }
    next()
  }

  async function handleRunDiagnosis() {
    if (!sessionId) return
    setIsLoading(true)
    setErrorMsg(null)
    const res = await runDiagnosis(sessionId)
    setIsLoading(false)
    if (!res.success) { setErrorMsg(res.error); return }
    setEngineResult(res.data.result)
    next()
  }

  async function handleCreateTicket() {
    if (!sessionId) return
    setIsLoading(true)
    setErrorMsg(null)
    const res = await escalateToDiagnosis(
      sessionId,
      selectedMachineId ?? '',
      selectedCategory?.label ?? 'Machine issue',
      uploadedPaths
    )
    setIsLoading(false)
    if (!res.success) { setErrorMsg(res.error); return }
    setTicketNumber(res.data.ticketNumber)
    next()
  }

  // ---------------------------------------------------------------------------
  // Parts toggle
  // ---------------------------------------------------------------------------

  function togglePart(id: string) {
    setAddedParts((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">

      {step > 1 && step <= FLOW_STEPS && (
        <button
          type="button"
          onClick={back}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}

      <ProgressBar step={step} />

      {/* Error banner */}
      {errorMsg && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Step 1 — Start                                                   */}
      {/* ---------------------------------------------------------------- */}
      {step === 1 && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Wrench className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Let&apos;s fix your machine
          </h1>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Answer a few quick questions and we&apos;ll diagnose the problem — usually in under 2 minutes.
          </p>

          <Button size="lg" className="mt-10 w-full max-w-xs" onClick={next}>
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>

          <button
            type="button"
            onClick={() => router.push('/support-tickets')}
            className="mt-4 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Skip to support tickets
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Step 2 — Select machine                                          */}
      {/* ---------------------------------------------------------------- */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold">Which machine needs attention?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select the machine that&apos;s having trouble.
          </p>

          <div className="mt-6 space-y-3">
            {PLACEHOLDER_MACHINES.map((machine) => {
              const Icon = MACHINE_ICONS[machine.category] ?? HelpCircle
              const loading = isLoading && selectedMachineId === machine.id
              return (
                <button
                  key={machine.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleMachineSelect(machine.id)}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all',
                    'hover:border-primary/50 hover:bg-primary/5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:pointer-events-none disabled:opacity-60',
                    selectedMachineId === machine.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  )}
                >
                  <div className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                    selectedMachineId === machine.id ? 'bg-primary/15' : 'bg-muted'
                  )}>
                    <Icon className={cn(
                      'h-5 w-5',
                      selectedMachineId === machine.id ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight">{machine.nickname}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{machine.model}</p>
                  </div>
                  {loading
                    ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                    : <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  }
                </button>
              )
            })}
          </div>

          <Link
            href="/my-machines/add"
            className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Plus className="h-4 w-4 shrink-0" />
            My machine isn&apos;t listed — register it first
          </Link>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Step 3 — Select issue category                                   */}
      {/* ---------------------------------------------------------------- */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold">
            What&apos;s the problem with {selectedMachine?.nickname ?? 'your machine'}?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the option that best describes it.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const Icon    = ISSUE_ICONS[iconKeyForCategory(cat.label)] ?? HelpCircle
              const selected = selectedCategoryId === cat.id
              const loading  = isLoading && selectedCategoryId === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all',
                    'hover:border-primary/50 hover:bg-primary/5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:pointer-events-none disabled:opacity-60',
                    selected ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    selected ? 'bg-primary/15' : 'bg-muted'
                  )}>
                    {loading
                      ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      : <Icon className={cn('h-5 w-5', selected ? 'text-primary' : 'text-muted-foreground')} />
                    }
                  </div>
                  <p className="text-sm font-medium leading-tight">{cat.label}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Step 4 — Guided question                                         */}
      {/* ---------------------------------------------------------------- */}
      {step === 4 && currentQuestion && (
        <div>
          <h2 className="text-lg font-semibold">{currentQuestion.question_text}</h2>
          {currentQuestion.hint_text && (
            <p className="mt-1 text-sm text-muted-foreground">{currentQuestion.hint_text}</p>
          )}

          <div className="mt-6 space-y-3">
            {currentQuestion.options.map((option) => {
              const selected = selectedOptionId === option.id
              const loading  = isLoading && selectedOptionId === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleOptionSelect(option.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all',
                    'hover:border-primary/50 hover:bg-primary/5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:pointer-events-none disabled:opacity-60',
                    selected ? 'border-primary bg-primary/5 font-medium' : 'border-border bg-card'
                  )}
                >
                  <div className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    selected ? 'border-primary' : 'border-muted-foreground/40'
                  )}>
                    {selected && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <span className="flex-1">{option.option_text}</span>
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Step 5 — Optional photo / video upload                          */}
      {/* ---------------------------------------------------------------- */}
      {step === 5 && (
        <div>
          <h2 className="text-lg font-semibold">Got a photo or video?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A visual helps us diagnose faster. This step is optional — skip it if you prefer.
          </p>

          {sessionId ? (
            <FileUploadZone
              sessionId={sessionId}
              onPathsChange={setUploadedPaths}
              onUploadingChange={setIsUploading}
              className="mt-6"
            />
          ) : (
            <p className="mt-6 text-sm text-destructive">
              Session lost. Please go back and restart the diagnosis.
            </p>
          )}

          <div className="mt-8 space-y-3">
            {uploadedPaths.length > 0 && (
              <Button
                className="w-full"
                disabled={isLoading || isUploading}
                onClick={handleRunDiagnosis}
              >
                {isLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <>
                      Continue with {uploadedPaths.length} file{uploadedPaths.length !== 1 ? 's' : ''}
                      <ArrowRight className="h-4 w-4" />
                    </>
                }
              </Button>
            )}
            <Button
              variant={uploadedPaths.length > 0 ? 'outline' : 'default'}
              className="w-full"
              disabled={isLoading || isUploading}
              onClick={handleRunDiagnosis}
            >
              {isLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : isUploading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  : uploadedPaths.length > 0
                    ? 'Skip upload'
                    : 'Skip this step'
              }
            </Button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Step 6 — Diagnosis result                                        */}
      {/* ---------------------------------------------------------------- */}
      {step === 6 && engineResult && (
        <div>
          <h2 className="text-lg font-semibold">Here&apos;s what we found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on what you told us about {selectedMachine?.nickname ?? 'your machine'}.
          </p>

          <div className="mt-6 space-y-4">
            {/* Likely cause */}
            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Likely cause
                  </p>
                  <Badge variant={URGENCY_CONFIG[engineResult.outcome.urgency].variant}>
                    {URGENCY_CONFIG[engineResult.outcome.urgency].label}
                  </Badge>
                </div>
                <p className="font-medium">{engineResult.outcome.title}</p>
                {engineResult.outcome.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{engineResult.outcome.description}</p>
                )}
              </CardContent>
            </Card>

            {/* What you reported */}
            <Card variant="flat">
              <CardContent className="p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  What you reported
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Machine</span>
                    <span className="text-right font-medium">{selectedMachine?.nickname ?? '—'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Issue</span>
                    <span className="text-right font-medium">{selectedCategory?.label ?? '—'}</span>
                  </div>
                  {currentQuestion && selectedOptionId && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-muted-foreground">Details</span>
                      <span className="max-w-[60%] text-right font-medium">
                        {currentQuestion.options.find((o) => o.id === selectedOptionId)?.option_text ?? '—'}
                      </span>
                    </div>
                  )}
                  {uploadedPaths.length > 0 && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-muted-foreground">Photos / videos</span>
                      <span className="font-medium">{uploadedPaths.length} attached</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommended action */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Recommended action
              </p>
              <p className="mt-1.5 text-sm">{engineResult.outcome.recommended_action}</p>
            </div>
          </div>

          <Button className="mt-8 w-full" onClick={next}>
            {engineResult.outcome.parts.length > 0 ? 'See recommended parts' : 'Create support ticket'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Step 7 — Recommended parts (or go straight to ticket)            */}
      {/* ---------------------------------------------------------------- */}
      {step === 7 && engineResult && (
        <div>
          {engineResult.outcome.parts.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold">Parts that could fix this</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on the diagnosis, these are the most likely parts needed.
              </p>

              <div className="mt-6 space-y-3">
                {engineResult.outcome.parts.map((part) => {
                  const added = addedParts.has(part.id)
                  return (
                    <Card
                      key={part.id}
                      className={cn(added && 'border-primary/40 bg-primary/5')}
                    >
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-tight">{part.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{part.part_number}</p>
                          {part.description && (
                            <p className="mt-1 text-xs text-muted-foreground">{part.description}</p>
                          )}
                          <p className="mt-2 text-sm font-semibold">${part.price.toFixed(2)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={added ? 'secondary' : 'outline'}
                          className="shrink-0"
                          onClick={() => togglePart(part.id)}
                        >
                          {added ? 'Added' : 'Add'}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="mt-8 space-y-3">
                {addedParts.size > 0 && (
                  <Button className="w-full" disabled={isLoading} onClick={handleCreateTicket}>
                    {isLoading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <>Order {addedParts.size} part{addedParts.size !== 1 ? 's' : ''} &amp; create ticket<ArrowRight className="h-4 w-4" /></>
                    }
                  </Button>
                )}
                <Button
                  variant={addedParts.size > 0 ? 'outline' : 'default'}
                  className="w-full"
                  disabled={isLoading}
                  onClick={handleCreateTicket}
                >
                  {isLoading && addedParts.size === 0
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : addedParts.size > 0
                      ? 'Skip parts — just create a ticket'
                      : "I'll have a technician look at it"
                  }
                </Button>
              </div>
            </>
          ) : (
            // No parts — direct to ticket
            <div className="flex flex-col items-center py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No specific parts are required for this diagnosis. A technician visit is recommended.
              </p>
              <Button className="mt-8 w-full" disabled={isLoading} onClick={handleCreateTicket}>
                {isLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <>Create support ticket<ArrowRight className="h-4 w-4" /></>
                }
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Step 8 — Confirmation                                            */}
      {/* ---------------------------------------------------------------- */}
      {step === 8 && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Ticket created</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our team has been notified and will follow up with you shortly.
          </p>

          <Card className="mt-8 w-full text-left">
            <CardContent className="p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ticket summary
              </p>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ticket number</span>
                  <span className="font-mono font-medium">{ticketNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Machine</span>
                  <span className="font-medium">{selectedMachine?.nickname ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Issue</span>
                  <span className="font-medium">{selectedCategory?.label ?? '—'}</span>
                </div>
                {addedParts.size > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Parts ordered</span>
                    <span className="font-medium">{addedParts.size} item{addedParts.size !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {uploadedPaths.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Attachments</span>
                    <span className="font-medium">{uploadedPaths.length} file{uploadedPaths.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="default">Open</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 w-full space-y-3">
            <Button className="w-full" asChild>
              <Link href="/support-tickets">
                <LifeBuoy className="h-4 w-4" />
                View ticket
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
