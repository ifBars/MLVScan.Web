// @vitest-environment jsdom

import { act, type ComponentProps } from "react"
import { fireEvent, screen } from "@testing-library/dom"
import { afterEach, describe, expect, it } from "vitest"
import { createRoot, type Root } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"
import type { ThreatFamily, ThreatFamilyEvidence } from "@/types/mlvscan"
import ThreatFamilyMatches from "@/components/results/ThreatFamilyMatches"

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const createEvidence = (overrides: Partial<ThreatFamilyEvidence> = {}): ThreatFamilyEvidence => ({
  kind: "other",
  value: "Unspecified evidence",
  ruleId: null,
  location: null,
  callChainId: null,
  dataFlowChainId: null,
  pattern: null,
  methodLocation: null,
  confidence: null,
  ...overrides,
})

const createMatch = (overrides: Partial<ThreatFamily> = {}): ThreatFamily => ({
  familyId: "family-webdownload-stage-exec-v2",
  variantId: "variant-a",
  displayName: "Web download staged payload executor",
  summary: "A network client downloads a payload into TEMP and immediately launches it.",
  matchKind: "BehaviorVariant",
  confidence: 0.96,
  exactHashMatch: false,
  matchedRules: ["DataFlowAnalysis", "ProcessStartRule", "NetworkDownloadRule", "TempStageRule"],
  advisorySlugs: [],
  evidence: [
    createEvidence({ kind: "pattern", value: "DownloadAndExecute", pattern: "DownloadAndExecute" }),
    createEvidence({ kind: "source", value: "network download" }),
    createEvidence({ kind: "execution", value: "Hidden cmd.exe launch" }),
  ],
  ...overrides,
})

const renderThreatFamilyMatches = (props: ComponentProps<typeof ThreatFamilyMatches>) => {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  act(() => {
    root.render(
      <MemoryRouter>
        <ThreatFamilyMatches {...props} />
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

describe("ThreatFamilyMatches", () => {
  it("renders a compact summary-first match block with evidence details hidden by default", () => {
    renderThreatFamilyMatches({ matches: [createMatch()], primaryThreatFamilyId: null })

    expect(screen.getByText("Known malware family match")).toBeTruthy()
    expect(screen.getByText("Web download staged payload executor")).toBeTruthy()
    expect(screen.getByText("Downloads and executes code")).toBeTruthy()
    expect(screen.getByText("network download")).toBeTruthy()
    expect(screen.getByRole("link", { name: /open family page/i }).getAttribute("href")).toBe(
      "/advisories/families/webdownload-stage-exec-v2",
    )
    expect(screen.queryByText("Hidden cmd.exe launch")).toBeNull()
  })

  it("reveals the full evidence list when the accordion is opened", () => {
    renderThreatFamilyMatches({ matches: [createMatch()], primaryThreatFamilyId: null })

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Why this matched (3)" }))
    })

    expect(screen.getByText("Hidden cmd.exe launch")).toBeTruthy()
    expect(screen.getByText("webdownload")).toBeTruthy()
  })

  it("emphasizes the disposition-linked family before higher-confidence secondary matches", () => {
    const lowerConfidencePrimary = createMatch({
      familyId: "family-webdownload-stage-exec-v2",
      displayName: "Primary family",
      confidence: 0.62,
    })
    const higherConfidenceSecondary = createMatch({
      familyId: "family-powershell-iwr-dlbat-v1",
      variantId: "variant-b",
      displayName: "Secondary family",
      summary: "PowerShell stages a batch file in TEMP and runs it hidden.",
      confidence: 0.97,
    })

    const { container } = renderThreatFamilyMatches({
      matches: [higherConfidenceSecondary, lowerConfidencePrimary],
      primaryThreatFamilyId: "family-webdownload-stage-exec-v2",
    })

    const primaryMatch = container.querySelector('[data-emphasis="primary"]')
    const secondaryMatch = container.querySelector('[data-emphasis="secondary"]')

    expect(screen.getByText("Additional matches")).toBeTruthy()
    expect(primaryMatch?.textContent).toContain("Primary family")
    expect(secondaryMatch?.textContent).toContain("Secondary family")
  })

  it("renders the family page link only when registry metadata exists", () => {
    renderThreatFamilyMatches({
      matches: [createMatch({ familyId: "unknown-family-id", displayName: "Unknown family" })],
      primaryThreatFamilyId: null,
    })

    expect(screen.queryByRole("link", { name: /open family page/i })).toBeNull()
  })

  it("keeps the summary stable when no evidence items are present", () => {
    renderThreatFamilyMatches({
      matches: [createMatch({ evidence: [], displayName: "No evidence family" })],
      primaryThreatFamilyId: null,
    })

    expect(screen.getByText("No evidence family")).toBeTruthy()
    expect(screen.getByText("No evidence details were included with this family match.")).toBeTruthy()
    expect(screen.queryByRole("button", { name: /Why this matched/i })).toBeNull()
  })
})
