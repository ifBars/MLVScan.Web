import { afterEach, describe, expect, it, vi } from "vitest"

import {
  PublicReportNotFoundError,
  fetchPublicReport,
} from "./public-report-api"
import type { PublicReportPayload } from "@/types/public-report"

const payload: PublicReportPayload = {
  submissionId: "sub_test",
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
  findings: [{
    id: null,
    ruleId: "ProcessStartRule",
    description: "Starts a process",
    severity: "High",
    location: "Sample.Type::Run",
    visibility: "Default",
  }],
  findingCount: 1,
  triggeredRules: ["ProcessStartRule"],
  relatedReports: [{
    submissionId: "sub_test",
    reportId: "report-1",
    fileName: "KeybindManager.dll",
    contentHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    schemaVersion: "1.2.0",
    status: "completed",
    classification: "Suspicious",
    findingCount: 1,
    createdAt: "2026-05-24T12:00:00.000Z",
    current: true,
  }],
}

describe("public-report-api", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("fetches public source-linked scan reports", async () => {
    vi.stubEnv("VITE_PUBLIC_API_BASE_URL", "http://localhost:3000")

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchPublicReport("sub_test")

    expect(result.classification).toBe("Suspicious")
    expect(result.findings[0]?.ruleId).toBe("ProcessStartRule")
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/public/reports/sub_test",
      expect.objectContaining({
        method: "GET",
      }),
    )
  })

  it("throws a not-found error for missing public reports", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })))

    await expect(fetchPublicReport("missing-report")).rejects.toBeInstanceOf(
      PublicReportNotFoundError,
    )
  })
})
