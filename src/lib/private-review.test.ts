import { afterEach, expect, it, vi } from 'vitest'
import { submitPrivateReview } from './private-review'
import { setDiagnosticChoice } from './telemetry'

afterEach(() => vi.unstubAllGlobals())
it('uploads 256 MiB in bounded parts, then confirms the receipt', async () => {
  const id = '12345678-1234-4234-8234-123456789012'
  const file = new File(['fixture'], 'large.dll')
  Object.defineProperty(file, 'size', { value: 256 * 1024 * 1024 })
  const slice = vi.spyOn(file, 'slice').mockReturnValue(new Blob(['part']))
  const fetcher = vi.fn(async (url: string) => new Response(JSON.stringify(
    url.endsWith('/uploads') ? { reviewId: id, uploadToken: id, partSize: 16 * 1024 * 1024 }
      : url.includes('/parts/') ? { partNumber: Number(url.split('/').pop()), etag: 'test' } : { reviewId: id }), { status: 201 }))
  vi.stubGlobal('fetch', fetcher)
  expect(await submitPrivateReview({ ...input(), file })).toBe(id)
  expect(slice).toHaveBeenCalledTimes(16)
  expect(slice).toHaveBeenLastCalledWith(240 * 1024 * 1024, 256 * 1024 * 1024)
  expect(fetcher).toHaveBeenCalledTimes(18)
  const oversized = new File(['fixture'], 'oversized.dll')
  Object.defineProperty(oversized, 'size', { value: 256 * 1024 * 1024 + 1 })
  await expect(submitPrivateReview({ ...input(), file: oversized })).rejects.toThrow('256 MiB')
  expect(fetcher).toHaveBeenCalledTimes(18)
})
const input = () => ({ file: new File(['safe fixture'], 'private-canary.dll'), kind: 'false_positive' as const,
  notes: 'private-canary', sourceUrl: '', consent: true })
it('allows private submissions without analytics and sends no cookies', async () => {
  setDiagnosticChoice('declined')
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ reviewId: '12345678-1234-4234-8234-123456789012' }), { status: 201 }))
  vi.stubGlobal('fetch', fetcher)
  expect(await submitPrivateReview(input())).toBe('12345678-1234-4234-8234-123456789012')
  expect(fetcher.mock.calls[0][0]).toContain('/files/private-review')
  const request = fetcher.mock.calls[0][1]
  expect(request.credentials).toBe('omit')
  const metadata = JSON.parse(request.body.get('metadata'))
  expect(metadata).toMatchObject({ shareDiagnostics: false, consentVersion: '3', channel: 'website', submissionKind: 'false_positive' })
})
it('requires file-specific consent, validates size and rejects non-http source URLs', async () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher)
  await expect(submitPrivateReview({ ...input(), consent: false })).rejects.toThrow('agree')
  await expect(submitPrivateReview({ ...input(), file: new File([], 'empty.dll') })).rejects.toThrow('non-empty')
  await expect(submitPrivateReview({ ...input(), sourceUrl: 'javascript:alert(1)' })).rejects.toThrow('http')
  expect(fetcher).not.toHaveBeenCalled()
})
it('fails closed when private storage is unavailable, without a public fallback', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 503 })); vi.stubGlobal('fetch', fetcher)
  await expect(submitPrivateReview(input())).rejects.toThrow('temporarily unavailable')
  expect(fetcher).toHaveBeenCalledTimes(1)
})
