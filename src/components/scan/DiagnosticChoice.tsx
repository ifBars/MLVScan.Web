import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { getDiagnosticChoice, setDiagnosticChoice, subscribeDiagnosticChoice } from '@/lib/telemetry'

export default function DiagnosticChoice({ settings = false, onDecision }: { settings?: boolean; onDecision?: () => void }) {
  const choice = useSyncExternalStore(subscribeDiagnosticChoice, getDiagnosticChoice, () => 'undecided')
  if (!settings && choice !== 'undecided') return null
  const decide = (value: 'allowed' | 'declined') => { setDiagnosticChoice(value); onDecision?.() }
  if (!settings) return <aside aria-label="Optional scan diagnostics"
    className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 w-[calc(100%-2rem)] max-w-sm rounded-xl border border-white/15 bg-[#10191f] p-5 text-sm shadow-xl shadow-black/30 sm:bottom-6 sm:right-6">
    <h2 className="font-semibold text-white">Help improve MLVScan</h2>
    <p className="mt-2 leading-relaxed text-gray-300">Allow scan counts and submission diagnostics? Includes a random reference to link a submission to its private review. No files, names, hashes or lasting user ID.</p>
    <Link to="/docs/privacy#optional-diagnostics" className="mt-2 inline-block text-xs text-teal-300 underline underline-offset-4">What is shared</Link>
    <div className="mt-4 grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" onClick={() => decide('declined')}>No thanks</Button>
      <Button type="button" onClick={() => decide('allowed')}>Allow diagnostics</Button>
    </div>
    <p className="mt-3 text-xs text-gray-400">Optional. Change your choice in Privacy settings.</p>
  </aside>
  return <section aria-label="Optional scan diagnostics" className="my-6 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="max-w-xl">
        <h2 className="font-semibold text-white">Help improve detection</h2>
        <p className="mt-1 text-gray-400">Share scan counts and submission diagnostics. Includes a random reference to link a submission to its private review. No files, names, hashes or lasting user ID.</p>
        <p className="mt-2 text-xs text-gray-500">Optional · <Link to="/docs/privacy#optional-diagnostics" className="text-teal-300 underline">What is shared</Link></p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" aria-pressed={choice === 'declined'} onClick={() => decide('declined')}>{settings ? 'Turn off diagnostics' : 'No thanks'}</Button>
        <Button type="button" aria-pressed={choice === 'allowed'} onClick={() => decide('allowed')}>Allow diagnostics</Button>
      </div>
    </div>
    <p aria-live="polite" className="mt-3 text-xs text-gray-400">{choice === 'allowed' ? 'Future scan counts and submission diagnostics will be sent to PostHog. Change this choice using Privacy settings in the footer.' : 'Diagnostics stay off unless you allow them. Scanning works either way.'}</p>
  </section>
}
