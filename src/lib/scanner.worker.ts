import * as wasmCore from "@mlvscan/wasm-core"

import type { ScanResult } from "@/types/mlvscan"
import type { ScanProgress } from "@/lib/scanner"

type WasmCoreWithProgress = typeof wasmCore & {
  scanAssemblyWithProgress?: (
    fileBytes: Uint8Array,
    fileName: string,
    onProgress: (progress: ScanProgress) => void
  ) => Promise<ScanResult>
}

const wasmScanner = wasmCore as WasmCoreWithProgress

type ScanWorkerRequest = {
  id: string
  baseUrl: string
  fileBytes: Uint8Array
  fileName: string
}

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

let scannerInitPromise: Promise<void> | null = null

const ensureScanner = (baseUrl: string): Promise<void> => {
  scannerInitPromise ??= wasmCore.initScanner({
    baseUrl,
    useMock: false,
  })
  return scannerInitPromise
}

self.onmessage = async (event: MessageEvent<ScanWorkerRequest>) => {
  const request = event.data

  try {
    await ensureScanner(request.baseUrl)
    const result = wasmScanner.scanAssemblyWithProgress
      ? await wasmScanner.scanAssemblyWithProgress(
        request.fileBytes,
        request.fileName,
        (progress) => {
          self.postMessage({
            id: request.id,
            type: "progress",
            progress,
          } satisfies ScanWorkerResponse)
        }
      )
      : await wasmCore.scanAssembly(request.fileBytes, request.fileName) as ScanResult

    self.postMessage({
      id: request.id,
      type: "result",
      ok: true,
      result,
    } satisfies ScanWorkerResponse)
  } catch (error) {
    self.postMessage({
      id: request.id,
      type: "error",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    } satisfies ScanWorkerResponse)
  }
}
