'use client'

// components/support/file-upload-zone.tsx
// Drag-and-drop + tap-to-browse upload widget for diagnosis session attachments.
//
// Uploads each file immediately on selection via Supabase Storage.
// Propagates completed storage paths and uploading status to the parent.

import { useState, useRef, useEffect } from 'react'
import {
  Camera, Film, Plus,
  Loader2, CheckCircle2, AlertCircle, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadSessionFile, validateFile } from '@/lib/diagnosis/storage'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UploadStatus = 'uploading' | 'done' | 'error'

interface FileEntry {
  id:          string
  file:        File
  previewUrl:  string   // '' for videos
  isVideo:     boolean
  status:      UploadStatus
  storagePath: string | null
  errorMsg:    string | null
}

export interface FileUploadZoneProps {
  sessionId:          string
  /** Called with the array of completed storage paths whenever it changes. */
  onPathsChange:      (paths: string[]) => void
  /** Called whenever the "any files currently uploading" boolean changes. */
  onUploadingChange?: (isUploading: boolean) => void
  className?:         string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const MAX_FILES = 10

export function FileUploadZone({
  sessionId,
  onPathsChange,
  onUploadingChange,
  className,
}: FileUploadZoneProps) {
  const [entries,         setEntries]         = useState<FileEntry[]>([])
  const [isDragging,      setIsDragging]       = useState(false)
  const [validationError, setValidationError]  = useState<string | null>(null)
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const dragCounter   = useRef(0)           // prevents flicker on child drag-enter
  // Keep a live ref to entries so the unmount cleanup can revoke all object URLs
  // without capturing a stale closure. A plain useEffect(() => cleanup, []) would
  // close over the initial empty array and revoke nothing.
  const entriesRef = useRef<FileEntry[]>(entries)
  entriesRef.current = entries

  // Notify parent whenever entries change
  useEffect(() => {
    const paths = entries
      .filter((e): e is FileEntry & { storagePath: string } =>
        e.status === 'done' && e.storagePath !== null
      )
      .map((e) => e.storagePath)

    onPathsChange(paths)
    onUploadingChange?.(entries.some((e) => e.status === 'uploading'))
  }, [entries]) // eslint-disable-line react-hooks/exhaustive-deps

  // Revoke every object URL when the component unmounts.
  // Reads from entriesRef (always current) to avoid the stale-closure problem.
  useEffect(() => {
    return () => {
      entriesRef.current.forEach((e) => { if (e.previewUrl) URL.revokeObjectURL(e.previewUrl) })
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Core: process & upload
  // ---------------------------------------------------------------------------

  async function processFiles(files: File[]) {
    setValidationError(null)

    // Respect max-files cap
    const remaining = MAX_FILES - entries.length
    if (remaining <= 0) {
      setValidationError(`You can attach up to ${MAX_FILES} files.`)
      return
    }
    const toProcess = files.slice(0, remaining)

    // Validate all before touching state
    for (const file of toProcess) {
      const err = validateFile(file)
      if (err) { setValidationError(err); return }
    }

    // Create placeholder entries immediately for instant visual feedback
    const newEntries: FileEntry[] = toProcess.map((file) => ({
      id:          crypto.randomUUID(),
      file,
      previewUrl:  file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      isVideo:     file.type.startsWith('video/'),
      status:      'uploading',
      storagePath: null,
      errorMsg:    null,
    }))

    setEntries((prev) => [...prev, ...newEntries])

    // Upload in parallel
    await Promise.all(newEntries.map(async (entry) => {
      const result = await uploadSessionFile(sessionId, entry.file)
      setEntries((prev) =>
        prev.map((e) =>
          e.id !== entry.id ? e : {
            ...e,
            status:      result.error ? 'error' : 'done',
            storagePath: result.error ? null : result.path,
            errorMsg:    result.error,
          }
        )
      )
    }))
  }

  // ---------------------------------------------------------------------------
  // Entry actions
  // ---------------------------------------------------------------------------

  function removeEntry(id: string) {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id)
      if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl)
      return prev.filter((e) => e.id !== id)
    })
  }

  async function retryEntry(id: string) {
    const entry = entries.find((e) => e.id === id)
    if (!entry) return

    setEntries((prev) =>
      prev.map((e) => e.id !== id ? e : { ...e, status: 'uploading', errorMsg: null })
    )

    const result = await uploadSessionFile(sessionId, entry.file)
    setEntries((prev) =>
      prev.map((e) =>
        e.id !== id ? e : {
          ...e,
          status:      result.error ? 'error' : 'done',
          storagePath: result.error ? null : result.path,
          errorMsg:    result.error,
        }
      )
    )
  }

  // ---------------------------------------------------------------------------
  // Drag-and-drop
  // ---------------------------------------------------------------------------

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()  // required to allow drop
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    if (files.length > 0) processFiles(files)
  }

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const hasEntries   = entries.length > 0
  const anyUploading = entries.some((e) => e.status === 'uploading')
  const atMax        = entries.length >= MAX_FILES

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={className}>

      {/* Validation / error banner */}
      {validationError && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{validationError}</span>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            aria-label="Dismiss"
            className="ml-auto shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Empty state: large drop zone */}
      {!hasEntries && (
        <button
          type="button"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex w-full flex-col items-center gap-4 rounded-xl border-2 border-dashed p-10 text-center',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-border hover:border-primary/40 hover:bg-primary/5'
          )}
        >
          <div className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
            isDragging ? 'bg-primary/20' : 'bg-muted'
          )}>
            <Camera className={cn(
              'h-7 w-7 transition-colors',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragging ? 'Drop to upload' : 'Tap to add photos or videos'}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag &amp; drop here, or tap to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Images up to&nbsp;20&nbsp;MB &middot; Videos up to&nbsp;100&nbsp;MB
            </p>
          </div>
        </button>
      )}

      {/* Files present: thumbnail grid */}
      {hasEntries && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'rounded-xl transition-all duration-200',
            isDragging && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          )}
        >
          <div className="grid grid-cols-3 gap-2">
            {entries.map((entry) => (
              <FileTile
                key={entry.id}
                entry={entry}
                onRemove={() => removeEntry(entry.id)}
                onRetry={() => retryEntry(entry.id)}
              />
            ))}

            {/* "Add more" tile — hidden when at cap */}
            {!atMax && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'aspect-square rounded-lg border-2 border-dashed',
                  'flex flex-col items-center justify-center gap-1.5',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-primary/5'
                )}
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add more</span>
              </button>
            )}
          </div>

          {/* Global upload status message */}
          {anyUploading && (
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading — please wait before continuing
            </p>
          )}
          {!anyUploading && isDragging && (
            <p className="mt-2.5 text-center text-xs text-primary">
              Drop to upload
            </p>
          )}
        </div>
      )}

      {/* Hidden file input — no `capture` so mobile shows camera + library choice */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) processFiles(Array.from(e.target.files))
          e.target.value = ''   // allow re-selecting the same file
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// FileTile — single thumbnail with status overlay
// ---------------------------------------------------------------------------

interface FileTileProps {
  entry:    FileEntry
  onRemove: () => void
  onRetry:  () => void
}

function FileTile({ entry, onRemove, onRetry }: FileTileProps) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">

      {/* Thumbnail */}
      {entry.isVideo ? (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 p-2">
          <Film className="h-7 w-7 text-muted-foreground" />
          <p className="w-full truncate text-center text-[10px] text-muted-foreground">
            {entry.file.name}
          </p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.previewUrl}
          alt={entry.file.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      )}

      {/* Uploading overlay — spinner on dark scrim */}
      {entry.status === 'uploading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      )}

      {/* Error overlay — tap to retry */}
      {entry.status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-destructive/75 p-2 text-center">
          <AlertCircle className="h-5 w-5 text-white" />
          <p className="text-[10px] font-medium leading-tight text-white">Upload failed</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-white/30"
          >
            Retry
          </button>
        </div>
      )}

      {/* Done badge — small green tick in corner */}
      {entry.status === 'done' && (
        <div className="absolute right-1.5 top-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
      )}

      {/* Remove button — appears on hover/focus, hidden while uploading */}
      {entry.status !== 'uploading' && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${entry.file.name}`}
          className={cn(
            'absolute left-1.5 top-1.5',
            'flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white',
            'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
          )}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
