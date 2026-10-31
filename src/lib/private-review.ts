import { resolvePublicApiBaseUrl } from './public-api-base-url'
import { DIAGNOSTIC_CONSENT_VERSION, getDiagnosticChoice } from './telemetry'

export const MAX_PRIVATE_SAMPLE_BYTES = 256 * 1024 * 1024
export type SubmissionKind = 'false_positive' | 'suspected_malware' | 'unsure'
export interface PrivateReviewInput { file: File; kind: SubmissionKind; notes: string; sourceUrl: string; consent: boolean }

export async function submitPrivateReview(input: PrivateReviewInput, onProgress?: (percent: number) => void): Promise<string> {
  if (!input.consent) throw new Error('Please agree to private review before submitting.')
  if (input.file.size === 0 || input.file.size > MAX_PRIVATE_SAMPLE_BYTES) throw new Error('Choose a non-empty file up to 256 MiB.')
  if (input.notes.length > 4000) throw new Error('Please keep notes under 4,000 characters.')
  const sourceUrl = input.sourceUrl.trim()
  if (sourceUrl && (!/^https?:\/\//i.test(sourceUrl) || sourceUrl.length > 2048)) throw new Error('Use an http or https source link.')
  if (sourceUrl) { try { new URL(sourceUrl) } catch { throw new Error('Enter a valid source link.') } }
  const body = new FormData()
  body.set('file', input.file)
  body.set('metadata', JSON.stringify({ consentVersion: '3', consentTimestamp: new Date().toISOString(),
    channel: 'website', submissionKind: input.kind, notes: input.notes,
    ...(sourceUrl ? { sourceUrl } : {}), shareDiagnostics: getDiagnosticChoice() === 'allowed',
    diagnosticConsentVersion: DIAGNOSTIC_CONSENT_VERSION }))
  const base = resolvePublicApiBaseUrl({ configuredBaseUrl: import.meta.env.VITE_PUBLIC_API_BASE_URL })
  let response: Response
  if (input.file.size <= 64 * 1024 * 1024) {
    response = await fetch(`${base}/files/private-review`, {
      method: 'POST', body, credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(120000),
    })
  } else {
    const request = async (url: string, init: RequestInit) => {
      for (let attempt = 0; ; attempt++) {
        const result = await fetch(url, { ...init, credentials: 'omit', redirect: 'error',
          referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(120000) })
        if (result.status !== 429 || attempt === 1) return result
        const seconds = Number(result.headers.get('Retry-After') ?? 60)
        await result.body?.cancel()
        await new Promise(resolve => setTimeout(resolve, Math.min(60, Math.max(1, seconds || 60)) * 1000))
      }
    }
    const started = await request(`${base}/files/private-review/uploads`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: input.file.name,
        size: input.file.size, metadata: JSON.parse(body.get('metadata') as string) }) })
    if (!started.ok) throw new Error('Private upload could not be started. Please try again later.')
    const session = await started.json() as { reviewId: string; uploadToken: string; partSize: number }
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(session.reviewId) || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(session.uploadToken)
      || session.partSize !== 16 * 1024 * 1024) throw new Error('Invalid private upload session.')
    const endpoint = `${base}/files/private-review/uploads/${session.reviewId}`
    const parts: { partNumber: number; etag: string }[] = []
    for (let offset = 0; offset < input.file.size; offset += session.partSize) {
      const partNumber = parts.length + 1
      const uploaded = await request(`${endpoint}/parts/${partNumber}`, { method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream', 'X-Upload-Token': session.uploadToken },
        body: input.file.slice(offset, offset + session.partSize) })
      if (!uploaded.ok) throw new Error('Upload interrupted. Your submission has not been accepted. Please try again.')
      const part = await uploaded.json() as { partNumber: number; etag: string }
      if (part.partNumber !== partNumber || typeof part.etag !== 'string') throw new Error('Upload part could not be confirmed.')
      parts.push(part)
      onProgress?.(Math.min(99, Math.floor((offset + session.partSize) / input.file.size * 100)))
    }
    response = await request(`${endpoint}/complete`, { method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Upload-Token': session.uploadToken }, body: JSON.stringify({ parts }) })
  }
  if (!response.ok) {
    if (response.status === 413) throw new Error('The file exceeds the private review size limit.')
    if (response.status === 429) throw new Error('Too many submissions. Please wait a minute before trying again.')
    if (response.status === 503) throw new Error('Private review is temporarily unavailable. Your file has not been submitted.')
    throw new Error('The submission could not be confirmed. Please try again later.')
  }
  const receipt: unknown = await response.json()
  if (!receipt || typeof receipt !== 'object' || !('reviewId' in receipt) || typeof receipt.reviewId !== 'string'
    || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(receipt.reviewId)) throw new Error('The submission receipt could not be confirmed.')
  onProgress?.(100)
  return receipt.reviewId
}
