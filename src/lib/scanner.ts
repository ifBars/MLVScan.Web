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
  // _framework is served at the app base (from Vite's base config), not relative to
  // the current route. Use BASE_URL; never use window.location.pathname (that would
  // wrongly use /scan/ when on /scan, causing 404 for /scan/_framework/dotnet.js).
  const base = import.meta.env.BASE_URL
  if (base && base !== '/') {
    return base.endsWith('/') ? base : `${base}/`
  }
  return '/'
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
