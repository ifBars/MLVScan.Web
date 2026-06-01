import * as wasmCore from '@mlvscan/wasm-core'
import type { ScannerInitOptions, ScannerStatus } from '@mlvscan/wasm-core'
import type { ScanResult } from '@/types/mlvscan'

export type ScanProgress = {
  phase: string
  completedUnits: number
  totalUnits: number
  percentage: number
  currentItem?: string | null
}

type WasmCoreWithProgress = typeof wasmCore & {
  scanAssemblyWithProgress?: (
    fileBytes: Uint8Array,
    fileName: string,
    onProgress: (progress: ScanProgress) => void
  ) => Promise<ScanResult>
}

const wasmScanner = wasmCore as WasmCoreWithProgress

type ScanWorkerResponse =
  | {
    id: string
    type: "progress"
    progress: ScanProgress
  }
  | {
    id: string
    type: "result"
    ok: true
    result: ScanResult
  }
  | {
    id: string
    type: "error"
    ok: false
    error: string
  }

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
  return wasmCore.initScanner(options)
}

export const scanAssembly = async (fileBytes: Uint8Array, fileName: string): Promise<ScanResult> => {
  // Ensure scanner is initialized before scanning
  if (!wasmCore.isScannerReady()) {
    await initScanner()
  }
  const result = await wasmCore.scanAssembly(fileBytes, fileName)
  return result as ScanResult
}

export const scanAssemblyInWorker = async (
  fileBytes: Uint8Array,
  fileName: string,
  onProgress?: (progress: ScanProgress) => void
): Promise<ScanResult> => {
  if (typeof Worker === 'undefined') {
    if (wasmScanner.scanAssemblyWithProgress && onProgress) {
      if (!wasmCore.isScannerReady()) {
        await initScanner()
      }
      return wasmScanner.scanAssemblyWithProgress(fileBytes, fileName, onProgress)
    }

    return scanAssembly(fileBytes, fileName)
  }

  const worker = new Worker(new URL('./scanner.worker.ts', import.meta.url), { type: 'module' })
  const requestId = crypto.randomUUID()

  try {
    return await new Promise<ScanResult>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<ScanWorkerResponse>) => {
        const response = event.data
        if (response.id !== requestId) {
          return
        }

        if (response.type === "progress") {
          onProgress?.(response.progress)
          return
        }

        if (response.ok) {
          resolve(response.result)
          return
        }

        reject(new Error(response.error))
      }

      worker.onerror = (event) => {
        reject(new Error(event.message || 'Scanner worker failed'))
      }

      worker.postMessage({
        id: requestId,
        baseUrl: getBaseUrl(),
        fileBytes,
        fileName,
      })
    })
  } catch (error) {
    console.warn('Scanner worker unavailable, falling back to main-thread scan.', error)
    return scanAssembly(fileBytes, fileName)
  } finally {
    worker.terminate()
  }
}

export const isScannerReady = () => wasmCore.isScannerReady()

export const getScannerVersion = async () => wasmCore.getScannerVersion()

export const getSchemaVersion = async () => wasmCore.getSchemaVersion()

/** True when running in mock mode (requested or fallback). */
export const isMockScanner = () => wasmCore.isMockScanner()

/** Error that caused fallback to mock, or null. */
export const getInitError = () => wasmCore.getInitError()

/** Current scanner status for UI (ready, isMock, initError). */
export const getScannerStatus = (): ScannerStatus => wasmCore.getScannerStatus()

export type { ScannerStatus }
