// @vitest-environment jsdom

import { act } from "react"
import { screen } from "@testing-library/dom"
import { afterEach, describe, expect, it } from "vitest"
import { createRoot, type Root } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"
import type { Finding, ScanResult } from "@/types/mlvscan"
import ScanReport from "@/components/results/ScanReport"

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const createFinding = (overrides: Partial<Finding> = {}): Finding => ({
  id: "finding-1",
  ruleId: "IncompleteScanWarningRule",
  description:
    "Warning: Some parts of the assembly could not be scanned. Please ensure this is a valid Unity mod. This doesn't necessarily mean the mod is malicious.",
  severity: "Low",
  location: "Assembly scan pipeline",
  codeSnippet: null,
  riskScore: null,
  callChainId: null,
  dataFlowChainId: null,
  developerGuidance: null,
  callChain: null,
  dataFlowChain: null,
  visibility: "Advanced",
  ...overrides,
})

const createResult = (overrides: Partial<ScanResult> = {}): ScanResult => ({
  schemaVersion: "1.2.0",
  metadata: {
    coreVersion: "1.0.0",
    platformVersion: "1.0.0",
    timestamp: new Date().toISOString(),
    scanMode: "detailed",
    platform: "wasm",
    scannerVersion: "1.0.0",
  },
  input: {
    fileName: "test.dll",
    sizeBytes: 128,
    sha256Hash: "abc",
  },
  summary: {
    totalFindings: 1,
    countBySeverity: { Low: 1 },
    triggeredRules: ["IncompleteScanWarningRule"],
  },
  findings: [createFinding()],
  threatFamilies: null,
  disposition: {
    classification: "Clean",
    headline: "No known threats detected",
    summary: "No retained malicious verdict was produced.",
    blockingRecommended: false,
    primaryThreatFamilyId: null,
    relatedFindingIds: [],
  },
  ...overrides,
})

const renderScanReport = (result: ScanResult) => {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  act(() => {
    root.render(
      <MemoryRouter>
        <ScanReport result={result} onReset={() => {}} />
      </MemoryRouter>,
    )
  })

  return { container }
}

afterEach(() => {
  for (const { container, root } of mountedRoots.splice(0)) {
    act(() => {
      root.unmount()
    })
    container.remove()
  }

  document.body.innerHTML = ""
})

describe("ScanReport", () => {
  it("shows incomplete scans as manual review without opening advanced diagnostics", () => {
    renderScanReport(createResult())

    expect(screen.getAllByText("Manual Review Required").length).toBeGreaterThan(0)
    expect(screen.getByText("Analysis was incomplete")).toBeTruthy()
    expect(
      screen.getAllByText(
        "Warning: Some parts of the assembly could not be scanned. Please ensure this is a valid Unity mod. This doesn't necessarily mean the mod is malicious."
      ).length
    ).toBeGreaterThan(0)
    expect(screen.getByText("Manual review")).toBeTruthy()
    expect(screen.queryByText("No Known Threats Detected")).toBeNull()
  })
})
