import {
  initScanner as initPkgScanner,
  scanAssembly as scanPkgAssembly,
  isScannerReady as isPkgScannerReady,
  getScannerVersion as getPkgScannerVersion,
  getSchemaVersion as getPkgSchemaVersion,
  isMockScanner as isPkgMockScanner,
  getInitError as getPkgInitError,
  getScannerStatus as getPkgScannerStatus,
  type ScanResult,
  type ScannerInitOptions,
  type ScannerStatus,
} from '@mlvscan/wasm-core'

const getBaseUrl = (): string => {
  // _framework is always at the site root. Use absolute URL to avoid resolution
  // relative to current route (e.g. /scan) which would 404 for /scan/_framework/dotnet.js.
  if (typeof window === 'undefined') return '/'
  const base = import.meta.env.BASE_URL
  const path = base && base !== '/' ? (base.endsWith('/') ? base : `${base}/`) : '/'
  return new URL(path, window.location.origin).href
}

export const initScanner = async () => {
  const options: ScannerInitOptions = {
    baseUrl: getBaseUrl(),
    useMock: false
  }
  return initPkgScanner(options)
}

export const scanAssembly = async (fileBytes: Uint8Array, fileName: string): Promise<ScanResult> => {
  // Ensure scanner is initialized before scanning
  if (!isPkgScannerReady()) {
    await initScanner()
  }
  return scanPkgAssembly(fileBytes, fileName)
}

export const isScannerReady = () => isPkgScannerReady()

export const getScannerVersion = async () => getPkgScannerVersion()

export const getSchemaVersion = async () => getPkgSchemaVersion()

/** True when running in mock mode (requested or fallback). */
export const isMockScanner = () => isPkgMockScanner()

/** Error that caused fallback to mock, or null. */
export const getInitError = () => getPkgInitError()

/** Current scanner status for UI (ready, isMock, initError). */
export const getScannerStatus = (): ScannerStatus => getPkgScannerStatus()

export type { ScannerStatus }
