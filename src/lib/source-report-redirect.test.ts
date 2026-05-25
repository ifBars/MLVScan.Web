import { afterEach, describe, expect, it, vi } from "vitest"

import {
  fetchLatestSourceReportRedirect,
  parseSourceReportRedirectPath,
  SourceReportNotFoundError,
} from "./source-report-redirect"

describe("source-report-redirect", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("parses Nexus mod page paths", () => {
    expect(parseSourceReportRedirectPath("/schedule1/mods/1194")).toEqual({
      provider: "nexusmods",
      game: "schedule1",
      modId: "1194",
    })
  })

  it("parses Thunderstore package page paths", () => {
    expect(parseSourceReportRedirectPath("/c/schedule-i/p/ifBars/S1API_Forked/")).toEqual({
      provider: "thunderstore",
      game: "schedule-i",
      packageFullName: "ifBars/S1API_Forked",
    })
  })

  it("fetches the latest source-linked submission for a Nexus mod", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        data: [{
          provider: "nexusmods",
          game: "schedule1",
          sourceKey: "schedule1:1194:6293",
          latestSubmissionId: "sub_latest",
        }],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchLatestSourceReportRedirect({
      provider: "nexusmods",
      game: "schedule1",
      modId: "1194",
    })

    expect(result).toEqual({ submissionId: "sub_latest", reportPath: "/reports/sub_latest" })
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/sources?provider=nexusmods&game=schedule1&limit=1&modId=1194",
      expect.objectContaining({ method: "GET" }),
    )
  })

  it("throws a not-found error when no source-linked report exists", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ))

    await expect(fetchLatestSourceReportRedirect({
      provider: "thunderstore",
      game: "schedule-i",
      packageFullName: "ifBars/S1API_Forked",
    })).rejects.toBeInstanceOf(SourceReportNotFoundError)
  })
})
