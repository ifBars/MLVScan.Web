import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MAX_PRIVATE_SAMPLE_BYTES, submitPrivateReview, type SubmissionKind } from '@/lib/private-review'

const fieldClass = 'mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-400'

export default function PrivateReviewForm({ selectedFile, initialKind = 'false_positive' }: { selectedFile?: File; initialKind?: SubmissionKind }) {
  const [progress, setProgress] = useState(0)
  const [file, setFile] = useState<File | null>(selectedFile ?? null)
  const [kind, setKind] = useState<SubmissionKind>(initialKind)
  const [notes, setNotes] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!file || busy) return
    setBusy(true); setProgress(0); setError('')
    try { setReceipt(await submitPrivateReview({ file, kind, notes, sourceUrl, consent }, setProgress)) }
    catch (error) { setError(error instanceof Error ? error.message : 'The submission could not be confirmed.') }
    finally { setBusy(false) }
  }
  return <>
    {receipt ? <section role="status" className="rounded-2xl border border-teal-400/30 bg-teal-400/5 p-8">
      <ShieldCheck className="mb-4 text-teal-300" aria-hidden="true" />
      <h2 className="text-2xl font-semibold text-white">Submitted for private review</h2>
      <p className="mt-3 text-gray-300">Keep this receipt for any follow-up. It is not a public report link and does not grant access to your file.</p>
      <code className="mt-5 block break-all rounded-lg bg-black/30 p-3 text-sm text-teal-200">{receipt}</code>
      <p className="mt-4 text-sm text-gray-400">This is a review request, not an immediate scan result or a guarantee that a file is safe.</p>
      <Link to="/scan" className="mt-6 inline-block text-teal-300 underline">Return to the local scanner</Link>
    </section> : <form onSubmit={submit} className="space-y-6 rounded-2xl border border-white/10 bg-[#0e151c] p-6 sm:p-8">
      <fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
        <label className="block text-sm text-gray-300">What would you like us to review?
          <Select value={kind} onValueChange={value => setKind(value as SubmissionKind)} disabled={busy}>
            <SelectTrigger aria-label="What would you like us to review?" className="mt-2 h-12 rounded-lg border-white/15 bg-black/30 text-white shadow-none focus:ring-teal-400/50"><SelectValue /></SelectTrigger>
            <SelectContent position="popper" sideOffset={6} className="rounded-xl border-white/15 bg-[#111b23] p-1 text-gray-200 shadow-2xl">
              <SelectItem value="false_positive" className="rounded-lg py-3 focus:bg-teal-400/10 focus:text-teal-200">A possible false positive</SelectItem>
              <SelectItem value="suspected_malware" className="rounded-lg py-3 focus:bg-teal-400/10 focus:text-teal-200">Suspected malware</SelectItem>
              <SelectItem value="unsure" className="rounded-lg py-3 focus:bg-teal-400/10 focus:text-teal-200">Not sure</SelectItem>
            </SelectContent>
          </Select>
        </label>
        {selectedFile ? <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm">
          <p className="text-gray-400">File selected for private review</p>
          <p className="mt-1 break-all font-medium text-white">{selectedFile.name}</p>
          <p className="mt-1 text-gray-400">{selectedFile.size < 1024 ? `${selectedFile.size} bytes` : `${(selectedFile.size / 1024 / 1024).toFixed(2)} MiB`}{selectedFile.name.toLowerCase().endsWith('.zip') ? ' · The entire archive will be sent, including files that were not scanned.' : ' · Reuses the file you just scanned.'}</p>
        </div> : <label className="block text-sm text-gray-300">Sample file <span className="text-gray-500">· up to 256 MiB</span>
          <input required type="file" className={`${fieldClass} file:mr-4 file:rounded file:border-0 file:bg-teal-400/15 file:px-3 file:py-1 file:text-teal-200`} onChange={event => {
            const selected = event.target.files?.[0] ?? null
            setFile(selected); setError(selected && selected.size > MAX_PRIVATE_SAMPLE_BYTES ? 'Choose a file up to 256 MiB.' : '')
          }} />
        </label>}
        <label className="block text-sm text-gray-300">Public source link <span className="text-gray-500">· optional</span>
          <input type="url" maxLength={2048} className={fieldClass} value={sourceUrl} onChange={event => setSourceUrl(event.target.value)} placeholder="https://…" />
        </label>
        <label className="block text-sm text-gray-300">What should we know? <span className="text-gray-500">· optional</span>
          <textarea rows={4} maxLength={4000} className={fieldClass} value={notes} onChange={event => setNotes(event.target.value)} placeholder="What was flagged, the MLVScan version, and why you think the result may be incorrect." />
        </label>
        <p className="text-xs leading-5 text-gray-400">If diagnostics are enabled, a submission count, category and random receipt reference are sent to PostHog. The reference lets MLVScan link that event to this private review; it does not identify a user or grant file access. <Link to="/docs/privacy#optional-diagnostics" className="text-teal-300 underline">Privacy details</Link></p>
        <div className="rounded-lg border border-teal-400/15 bg-teal-400/5 p-4 text-sm">
          <p className="text-gray-300">Only MLVScan reviewers can access your submission. We do not publish or redistribute submissions, including false positives. Cloudflare stores the file and notes for review.</p>
          <p className="mt-2 text-gray-400">Files can contain personal or proprietary data. Include only what you are allowed to share. <Link to="/docs/privacy#private-sample-review" className="text-teal-300 underline">Privacy details</Link></p>
          <label className="mt-4 flex items-start gap-3 text-white"><input required type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 accent-teal-400" />I agree to send this file and the information above for private review.</label>
        </div>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <Button type="submit" disabled={!file || !consent || file.size > MAX_PRIVATE_SAMPLE_BYTES || busy} className="w-full">{busy ? (progress > 0 ? `Uploading ${progress}%...` : 'Submitting...') : 'Submit for private review'}</Button>
      </fieldset>
    </form>}
  </>
}
