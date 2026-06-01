// @vitest-environment jsdom

import { act } from "react"
import { fireEvent, screen } from "@testing-library/dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"

import type { ScanResult } from "@/types/mlvscan"
import ScanUploader from "@/components/scan/ScanUploader"
import { scanAssemblyInWorker, type ScanProgress } from "@/lib/scanner"

vi.mock("@/lib/scanner", () => ({
  scanAssemblyInWorker: vi.fn(),
}))

vi.mock("@/lib/browser-scan-attestation-handoff", () => ({
  saveBrowserScanAttestationHandoff: vi.fn(),
}))

vi.mock("@/lib/partner-dashboard-routes", () => ({
  getPartnerDashboardPath: () => "/dashboard/publish",
}))

vi.mock("@/components/results/ScanReport", () => ({
  default: () => <div data-testid="scan-report">Scan report</div>,
}))

type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T) => void
}

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
let currentPerformanceNow = 0

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })

  return { promise, resolve }
}

const createScanResult = (fileName: string): ScanResult => ({
  schemaVersion: "1.3.0",
  metadata: {
    coreVersion: "1.0.0",
    platformVersion: "1.0.0",
    timestamp: new Date().toISOString(),
    scanMode: "detailed",
    platform: "wasm",
    scannerVersion: "1.0.0",
  },
  input: {
    fileName,
    sizeBytes: 128,
    sha256Hash: "abc",
  },
  summary: {
    totalFindings: 0,
    countBySeverity: {},
    triggeredRules: [],
  },
  analysisCompleteness: {
    status: "Complete",
    isComplete: true,
    reviewRecommended: false,
    reasons: [],
  },
  findings: [],
  threatFamilies: null,
  disposition: {
    classification: "Clean",
    headline: "No known threats detected",
    summary: "No retained malicious verdict was produced.",
    blockingRecommended: false,
    primaryThreatFamilyId: null,
    relatedFindingIds: [],
  },
})

const renderScanUploader = () => {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  act(() => {
    root.render(
      <MemoryRouter>
        <ScanUploader />
      </MemoryRouter>,
    )
  })
}

const flushAsyncWork = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}

const getProgressLabel = (text: string) =>
  screen.getByText((_, element) => element?.textContent === text)

const getProgressFill = () => screen.getByTestId("scan-progress-fill") as HTMLElement

beforeEach(() => {
  vi.useFakeTimers()
  currentPerformanceNow = 0
  vi.spyOn(performance, "now").mockImplementation(() => currentPerformanceNow)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()

  for (const { container, root } of mountedRoots.splice(0)) {
    act(() => {
      root.unmount()
    })
    container.remove()
  }

  document.body.innerHTML = ""
})

describe("ScanUploader", () => {
  it("updates the visible scan percentage and progress bar from scanner progress events", async () => {
    const deferredScan = createDeferred<ScanResult>()
    let progressCallback: ((progress: ScanProgress) => void) | undefined
    vi.mocked(scanAssemblyInWorker).mockImplementation((_fileBytes, _fileName, onProgress) => {
      progressCallback = onProgress
      return deferredScan.promise
    })
    renderScanUploader()

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInstanceOf(HTMLInputElement)

    const file = new File([new Uint8Array([0x4d, 0x5a, 0x90, 0x00])], "SlowMod.dll", {
      type: "application/octet-stream",
    })

    await act(async () => {
      fireEvent.change(fileInput as HTMLInputElement, {
        target: {
          files: [file],
        },
      })
    })
    await flushAsyncWork()

    act(() => {
      vi.advanceTimersByTime(16)
    })
    await flushAsyncWork()

    expect(screen.getByText("Analyzing Code")).toBeTruthy()
    expect(getProgressLabel("1% Complete")).toBeTruthy()
    expect(getProgressFill().style.width).toBe("1%")

    act(() => {
      vi.advanceTimersByTime(16)
    })
    await flushAsyncWork()
    expect(scanAssemblyInWorker).toHaveBeenCalledWith(expect.any(Uint8Array), "SlowMod.dll", expect.any(Function))
    expect(progressCallback).toBeTypeOf("function")

    act(() => {
      currentPerformanceNow = 12_000
      vi.advanceTimersByTime(12_000)
    })
    expect(getProgressLabel("1% Complete")).toBeTruthy()
    expect(getProgressFill().style.width).toBe("1%")

    act(() => {
      progressCallback?.({
        phase: "ScanType",
        completedUnits: 47,
        totalUnits: 100,
        percentage: 47,
        currentItem: "SlowMod.Main",
      })
    })
    expect(getProgressLabel("47% Complete")).toBeTruthy()
    expect(getProgressFill().style.width).toBe("47%")

    act(() => {
      progressCallback?.({
        phase: "AnalyzeMethodDataFlow",
        completedUnits: 90,
        totalUnits: 100,
        percentage: 90,
        currentItem: "System.Void SlowMod.Main::Run()",
      })
    })
    expect(getProgressLabel("90% Complete")).toBeTruthy()
    expect(getProgressFill().style.width).toBe("90%")

    act(() => {
      progressCallback?.({
        phase: "PostAnalysisRefine",
        completedUnits: 94,
        totalUnits: 100,
        percentage: 94,
        currentItem: "ProcessStartRule",
      })
    })
    expect(getProgressLabel("94% Complete")).toBeTruthy()
    expect(getProgressFill().style.width).toBe("94%")
    expect(screen.queryByText((_, element) => element?.textContent === "100% Complete")).toBeNull()
    expect(screen.queryByTestId("scan-report")).toBeNull()

    await act(async () => {
      deferredScan.resolve(createScanResult("SlowMod.dll"))
      await deferredScan.promise
    })
    act(() => {
      vi.advanceTimersByTime(16)
    })
    await flushAsyncWork()

    expect(screen.getByTestId("scan-report")).toBeTruthy()
  })

  it("shows a clear oversized-file indicator instead of starting a scan", async () => {
    renderScanUploader()

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInstanceOf(HTMLInputElement)

    const file = new File([new Uint8Array([0x4d])], "HugeMod.dll", {
      type: "application/octet-stream",
    })
    Object.defineProperty(file, "size", {
      value: 101 * 1024 * 1024,
    })

    await act(async () => {
      fireEvent.change(fileInput as HTMLInputElement, {
        target: {
          files: [file],
        },
      })
    })

    expect(screen.getByText("File Too Large")).toBeTruthy()
    expect(screen.getByText(/Browser scans support files up to 100.0 MB/)).toBeTruthy()
    expect(screen.getByText(/scan the file locally with MLVScan\.DevCLI/)).toBeTruthy()
    expect(scanAssemblyInWorker).not.toHaveBeenCalled()
  })
})
