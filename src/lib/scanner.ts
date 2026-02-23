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

const getBaseUrl = () => {
  // Use Vite's BASE_URL if set, otherwise default to window origin + path
  const base = import.meta.env.BASE_URL
  
  // If we are in dev mode (localhost), use standard root
  if (import.meta.env.DEV) {
    return '/'
  }

  // If base is set to something specific (e.g. /MLVScan.Web/ for GitHub Pages), use it
  if (base && base !== '/') {
    return base.endsWith('/') ? base : `${base}/`
  }

  // Fallback to current location
  const path = window.location.pathname
  return path.endsWith('/') ? path : `${path}/`
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
