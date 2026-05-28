// @vitest-environment jsdom

import { act } from "react"
import { fireEvent, screen } from "@testing-library/dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import PublicReportPage from "@/pages/PublicReportPage"
import type { PublicReportPayload } from "@/types/public-report"

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const publicReportPayload: PublicReportPayload = {
  submissionId: "sub_public",
  reportId: "report-1",
  status: "completed",
  source: {
    provider: "nexusmods",
    game: "schedule1",
    sourceKey: "schedule1:1966:6293",
    displayName: "Keybind Manager",
    author: "Bars",
    version: "1.0.1",
    fileName: "Keybind Manager.zip",
    packageFileName: "Keybind Manager.zip",
    sourceUrl: "https://www.nexusmods.com/schedule1/mods/1966",
  },
  fileName: "KeybindManager.dll",
  contentHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  sizeBytes: 12345,
  scannerVersion: "1.5.0",
  schemaVersion: "1.2.0",
  scannedAt: "2026-05-24T12:00:00.000Z",
  classification: "Suspicious",
  headline: "Suspicious behavior detected",
  summary: "This scan retained suspicious findings.",
  blockingRecommended: false,
  primaryThreatFamilyId: null,
  threatFamilies: [],
  findings: [
    {
      id: "default-finding",
      ruleId: "ProcessStartRule",
      description: "Starts a process",
      severity: "High",
      location: "Sample.Type::Run",
      visibility: "Default",
    },
    {
      id: "advanced-finding",
      ruleId: "BroadNetworkApiRule",
      description: "References broad network APIs",
      severity: "Low",
      location: "Sample.Type::Fetch",
      visibility: "Advanced",
    },
  ],
  findingCount: 1,
  triggeredRules: ["ProcessStartRule", "BroadNetworkApiRule"],
  relatedReports: [
    {
      submissionId: "sub_public",
      reportId: "report-1",
      fileName: "KeybindManager.dll",
      contentHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      schemaVersion: "1.2.0",
      status: "completed",
      classification: "Suspicious",
      findingCount: 1,
      createdAt: "2026-05-24T12:00:00.000Z",
      current: true,
    },
  ],
}

const renderPublicReportPage = async () => {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={["/reports/sub_public"]}>
        <Routes>
          <Route path="/reports/:submissionId" element={<PublicReportPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await Promise.resolve()
    await Promise.resolve()
  })
}

afterEach(() => {
  for (const { container, root } of mountedRoots.splice(0)) {
    act(() => {
      root.unmount()
    })
    container.remove()
  }

  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  document.body.innerHTML = ""
})

describe("PublicReportPage", () => {
  it("shows advanced diagnostics only after opting in", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify(publicReportPayload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ))

    await renderPublicReportPage()

    expect(await screen.findByText("Keybind Manager")).toBeTruthy()
    expect(screen.getByText("Starts a process")).toBeTruthy()
    expect(screen.getByText("Show Advanced (1)")).toBeTruthy()
    expect(screen.queryByText("References broad network APIs")).toBeNull()

    act(() => {
      fireEvent.click(screen.getByText("Show Advanced (1)"))
    })

    expect(screen.getByText("References broad network APIs")).toBeTruthy()
    expect(screen.getByText("Hide Advanced")).toBeTruthy()
    expect(screen.getByText("Advanced")).toBeTruthy()
  })
})
