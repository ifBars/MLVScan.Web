import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ScanResult } from '@/types/mlvscan'
import { captureBrowserScan, getDiagnosticChoice, setDiagnosticChoice, summarizeScanDiagnostics } from './telemetry'

const fixture = { input: { fileName: 'private-canary.dll', sha256Hash: 'secret-hash' },
  disposition: { classification: 'Clean' }, analysisCompleteness: { isComplete: true },
  findings: [{ ruleId: 'ReflectionRule', severity: 'High', visibility: 'Advanced', description: 'private-canary', location: 'private-canary' }],
  threatFamilies: [], dataFlows: [],
} as unknown as ScanResult

beforeEach(() => {
  localStorage.clear(); setDiagnosticChoice('declined')
  vi.stubEnv('VITE_POSTHOG_PROJECT_TOKEN', 'phc_fixture')
  vi.stubEnv('VITE_TELEMETRY_ENVIRONMENT', 'development')
  vi.stubEnv('VITE_POSTHOG_REGION', 'us')
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })
describe('browser diagnostics', () => {
  it('renews old opt-ins for references but preserves old declines', () => {
    localStorage.clear()
    localStorage.setItem('mlvscan:diagnostics:v1', 'allowed')
    expect(getDiagnosticChoice()).toBe('undecided')
    localStorage.setItem('mlvscan:diagnostics:v1', 'declined')
    expect(getDiagnosticChoice()).toBe('declined')
    setDiagnosticChoice('allowed')
    expect(getDiagnosticChoice()).toBe('allowed')
  })
  it('keeps Advanced High findings separate from the clean verdict and removes identity', () => {
    const summary = summarizeScanDiagnostics([fixture])
    expect(summary.clean_count).toBe(1)
    expect(summary.rule_ReflectionRule_High_Advanced_Clean_findings).toBe(1)
    expect(JSON.stringify(summary)).not.toMatch(/private-canary|secret-hash/)
  })
  it('names scanner incompleteness findings instead of counting them as other', () => {
    const incomplete = { ...fixture,
      disposition: { classification: 'ManualReviewRequired' },
      analysisCompleteness: { isComplete: false, reasons: [
        { reasonId: 'scanner-incomplete', ruleId: 'AssemblyScanner' },
        { reasonId: 'scanner-incomplete', ruleId: 'AssemblyScanner' },
        { reasonId: 'scanner-incomplete', ruleId: 'private-canary' }] },
      findings: [{ ruleId: 'AssemblyScanner', severity: 'Medium', visibility: 'Default' }],
    } as unknown as ScanResult
    const summary = summarizeScanDiagnostics([incomplete])
    expect(summary.telemetry_schema_version).toBe(3)
    expect(summary.rule_AssemblyScanner_Medium_Default_ManualReviewRequired_findings).toBe(1)
    expect(summary.incomplete_AssemblyScanner_count).toBe(1)
    expect(summary.incomplete_other_count).toBe(1)
    expect(summary.incomplete_result_count).toBe(1)
    expect(JSON.stringify(summary)).not.toContain('private-canary')
  })
  it('maps hostile identifiers to bounded categories', () => {
    const hostile = { ...fixture, findings: Array.from({ length: 1000 }, (_, i) => ({ ruleId: `private-canary-${i}`, severity: 'private-canary', visibility: 'private-canary' })) } as unknown as ScanResult
    const summary = summarizeScanDiagnostics([hostile])
    expect(summary.rule_other_Unknown_Unknown_Clean_findings).toBe(1000)
    expect(summary.rule_other_Unknown_Unknown_Clean_results).toBe(1)
    expect(JSON.stringify(summary)).not.toContain('private-canary')
    expect(Object.keys(summary).length).toBeLessThanOrEqual(193)
  })
  it('never contacts PostHog when declined and rotates IDs for opted-in runs', async () => {
    const send = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', send)
    expect(await captureBrowserScan([fixture])).toBe(false)
    expect(send).not.toHaveBeenCalled()
    setDiagnosticChoice('allowed')
    expect(getDiagnosticChoice()).toBe('allowed')
    expect(await captureBrowserScan([fixture])).toBe(true)
    expect(await captureBrowserScan([fixture])).toBe(true)
    const first = JSON.parse(send.mock.calls[0][1].body)
    const second = JSON.parse(send.mock.calls[1][1].body)
    expect(first.distinct_id).not.toBe(second.distinct_id)
    expect(first.properties.$process_person_profile).toBe(false)
    expect(send.mock.calls[0][1]).toMatchObject({ credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer' })
    expect(JSON.stringify(first)).not.toMatch(/private-canary|secret-hash/)
    setDiagnosticChoice('declined')
    expect(await captureBrowserScan([fixture])).toBe(false)
    expect(send).toHaveBeenCalledTimes(2)
  })
  it('contains network failures without retries', async () => {
    const send = vi.fn().mockRejectedValue(new Error('offline'))
    vi.stubGlobal('fetch', send); setDiagnosticChoice('allowed')
    expect(await captureBrowserScan([fixture])).toBe(false)
    expect(send).toHaveBeenCalledTimes(1)
  })
})
