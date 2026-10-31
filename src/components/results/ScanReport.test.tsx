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
  schemaVersion: "1.4.0",
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
  analysisCompleteness: {
    status: "Complete",
    isComplete: true,
    reviewRecommended: false,
    reasons: [],
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

const renderPublishableScanReport = (result: ScanResult) => {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  act(() => {
    root.render(
      <MemoryRouter>
        <ScanReport result={result} onReset={() => {}} onCreateAttestation={() => {}} />
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

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Manual review required")
    expect(screen.getByText("Analysis was incomplete")).toBeTruthy()
    expect(
      screen.getByText(
        "Warning: Some parts of the assembly could not be scanned. Please ensure this is a valid Unity mod. This doesn't necessarily mean the mod is malicious."
      )
    ).toBeTruthy()
    expect(screen.getByText("Incomplete analysis")).toBeTruthy()
    expect(screen.queryByText("No known threats")).toBeNull()
  })

  it("shows the attestation CTA for clean publishable scans", () => {
    renderPublishableScanReport(createResult({
      findings: [],
      summary: {
        totalFindings: 0,
        countBySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 },
        triggeredRules: [],
      },
    }))

    expect(screen.getByText("Publishing this mod?")).toBeTruthy()
    expect(screen.getByText("Create Attestation")).toBeTruthy()
    expect(screen.queryByText("Copy Nexus Markdown")).toBeNull()
    expect(screen.getByText("Learn More")).toBeTruthy()
    expect(screen.getByText(/Screenshot only/)).toBeTruthy()
    expect(screen.getByText("This file did not produce any findings.")).toBeTruthy()
  })

  it("does not show the attestation CTA for blocked results", () => {
    renderPublishableScanReport(createResult({
      findings: [],
      summary: {
        totalFindings: 0,
        countBySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 },
        triggeredRules: [],
      },
      disposition: {
        classification: "KnownThreat",
        headline: "Likely malware detected",
        summary: "Known threat sample.",
        blockingRecommended: true,
        primaryThreatFamilyId: null,
        relatedFindingIds: [],
      },
    }))

    expect(screen.queryByText("Publishing this mod?")).toBeNull()
  })

  it("groups known-threat findings and separates verdict evidence from context", () => {
    const hiddenLaunch = createFinding({
      id: "hidden-launch",
      ruleId: "ProcessStartRule",
      description: "Detected Process.Start call which could execute arbitrary programs.",
      severity: "Critical",
      location: "Mod.Loader.DownloadAndLaunch:627",
      visibility: "Default",
      attributes: {
        target: "svchost.exe",
        targetKind: "Executable",
        indicators: ["CreateNoWindow=true", "WindowStyle=Hidden"],
      },
    })
    const links = Array.from({ length: 3 }, (_, index) =>
      createFinding({
        id: `link-${index}`,
        ruleId: "ProcessStartRule",
        description: "Detected Process.Start call which could execute arbitrary programs.",
        severity: "Medium",
        location: `Mod.Menu.Buttons.Open${index}:5`,
        visibility: "Default",
        attributes: { target: "github.com", targetKind: "Url" },
      })
    )

    renderScanReport(createResult({
      findings: [hiddenLaunch, ...links],
      summary: {
        totalFindings: 4,
        countBySeverity: { Critical: 1, Medium: 3 },
        triggeredRules: ["ProcessStartRule"],
      },
      threatFamilies: [{
        familyId: "family-dynamic-assembly-reflection-loader-v2",
        variantId: "variant-a",
        displayName: "Dynamic code loader with hidden system-binary-name launch",
        summary: "Loads code and launches a hidden system binary.",
        matchKind: "BehaviorVariant",
        confidence: 0.96,
        exactHashMatch: false,
        matchedRules: ["ProcessStartRule"],
        advisorySlugs: [],
        evidence: [],
        relatedFindingIds: ["hidden-launch"],
      }],
      disposition: {
        classification: "KnownThreat",
        headline: "Likely malware detected",
        summary: "This file matches a known malware family.",
        blockingRecommended: true,
        primaryThreatFamilyId: "family-dynamic-assembly-reflection-loader-v2",
        relatedFindingIds: ["hidden-launch", "link-0", "link-1", "link-2"],
      },
    }))

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Likely malware")
    expect(screen.getByText("Dynamic code loader with hidden system-binary-name launch")).toBeTruthy()
    expect(screen.getByText("Launches a hidden program")).toBeTruthy()
    expect(screen.getByText("Opens web links")).toBeTruthy()
    expect(screen.getByText("github.com ×3")).toBeTruthy()
    expect(screen.getAllByText("Used")).toHaveLength(1)
    expect(screen.getAllByText("Context")).toHaveLength(1)
    expect(screen.getByText("No console window, Hidden window")).toBeTruthy()

    const familyFindingsButton = screen.getByRole("button", { pressed: false, name: /1/ })
    act(() => {
      familyFindingsButton.click()
    })

    expect(screen.getByText(/Showing findings behind/)).toBeTruthy()
    expect(screen.queryByText("Opens web links")).toBeNull()
  })
})
