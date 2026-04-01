// lib/diagnosis/storage.ts
// Client-side Supabase Storage helpers for diagnosis session file attachments.
// Runs in the browser — uses the browser Supabase client (anon key + auth session).
//
// Required bucket setup (create once in Supabase dashboard):
//   Bucket name : diagnosis-uploads
//   Public      : false
//   RLS policies:
//     INSERT  auth.uid()::text = (storage.foldername(name))[1]
//     SELECT  auth.uid()::text = (storage.foldername(name))[1]
//     DELETE  auth.uid()::text = (storage.foldername(name))[1]
//
// File path convention: {userId}/{sessionId}/{timestamp}-{random}.{ext}
// This lets RLS lock each user to their own subtree while still allowing
// admins to list all attachments for a given session.

import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const UPLOAD_BUCKET = 'diagnosis-uploads'

const MAX_IMAGE_BYTES = 20 * 1024 * 1024   //  20 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024  // 100 MB

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable error message if the file should be rejected,
 * or null if the file is acceptable.
 *
 * We rely on the browser's `accept="image/*,video/*"` attribute as the first
 * filter and use MIME-type prefix matching here as the safety net.
 * Explicit type allow-lists were previously attempted but are redundant because
 * every listed type also starts with "image/" or "video/", making the Set check
 * unreachable. Simplifying to startsWith keeps the intent clear.
 */
export function validateFile(file: File): string | null {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')

  if (!isImage && !isVideo) {
    return `"${file.name}" is not a supported format. Use JPG, PNG, WebP, or MP4/MOV.`
  }
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return `"${file.name}" is too large. Images must be under 20 MB.`
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return `"${file.name}" is too large. Videos must be under 100 MB.`
  }
  return null
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export interface UploadResult {
  /** Storage path returned by Supabase (relative to bucket root). */
  path:  string
  error: string | null
}

/**
 * Uploads a single file to the diagnosis-uploads bucket.
 * Returns the storage path on success, or an error message on failure.
 */
export async function uploadSessionFile(
  sessionId: string,
  file:      File
): Promise<UploadResult> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { path: '', error: 'You must be signed in to upload files.' }
  }

  const ext    = (file.name.split('.').pop() ?? 'bin').toLowerCase()
  const random = Math.random().toString(36).slice(2, 8)
  const name   = `${Date.now()}-${random}.${ext}`
  const path   = `${user.id}/${sessionId}/${name}`

  const { data, error } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) return { path: '', error: error.message }

  return { path: data.path, error: null }
}
