import * as wasmCore from '@mlvscan/wasm-core'
import type { ScannerInitOptions } from '@mlvscan/wasm-core'
import type { ScanResult } from '@/types/mlvscan'

const SCANNER_UNAVAILABLE_MESSAGE =
  'The MLVScan scanner could not be loaded, so this file was not scanned. No result is shown because nothing was checked.'

/**
 * Raised when the WASM scanner cannot start or returns a placeholder result. The browser must
 * never present a placeholder as a completed scan, so callers show a dedicated error instead.
 */
export class ScannerUnavailableError extends Error {
  readonly code = 'scanner-unavailable'
  constructor(cause?: unknown) {
    super(SCANNER_UNAVAILABLE_MESSAGE)
    this.name = 'ScannerUnavailableError'
    if (cause !== undefined) (this as { cause?: unknown }).cause = cause
  }
}

export const isScannerUnavailableError = (error: unknown): boolean =>
  error instanceof ScannerUnavailableError ||
  (error instanceof Error && error.message === SCANNER_UNAVAILABLE_MESSAGE)

/** True for wasm-core's placeholder output, which means no analysis ran. */
export const isPlaceholderScanResult = (result: Pick<ScanResult, 'metadata' | 'analysisCompleteness'> | null | undefined): boolean =>
  !result ||
  [result.metadata?.scannerVersion, result.metadata?.coreVersion].some(v => typeof v === 'string' && v.endsWith('-mock')) ||
  (result.analysisCompleteness?.reasons ?? []).some(r => r.reasonId === 'MockScanner')

/** Rejects placeholder output so it can never be rendered or counted as a scan. */
export const assertRealScanResult = (result: ScanResult): ScanResult => {
  if (wasmCore.isMockScanner() || isPlaceholderScanResult(result)) {
    throw new ScannerUnavailableError(wasmCore.getInitError() ?? undefined)
  }
  return result
}

/** Production init options: never fall back to the placeholder scanner. */
export const scannerInitOptions = (baseUrl: string): ScannerInitOptions => ({
  baseUrl,
  useMock: false,
  throwOnInitFailure: true,
})
