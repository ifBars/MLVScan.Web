import { afterEach, describe, expect, it, vi } from "vitest"

import { onRequest } from "../../functions/attestations/[shareId]/badge.svg"
import type { PublicAttestationPayload } from "../types/attestation"

const payload: PublicAttestationPayload = {
  shareId: "att_test",
  verificationTier: "self_submitted",
  publicationStatus: "published",
  sourceBindingStatus: "none",
  badgeStyle: "split-pill",
  badge: {
    schemaVersion: "badge.v1",
    style: "split-pill",
    brand: {
      kind: "mlvscan-check",
      label: "MLVScan attested",
    },
    tone: "clean",
    statusLabel: "Clean",
    fileLabel: "SampleMod.dll",
    verificationLabel: "Self-submitted",
    runtimeLabel: "IL2CPP",
    scannedDateLabel: "2026-04-06",
    shortHashLabel: "89abcdef",
  },
  publicDisplayName: "Sample Mod",
  fileName: "SampleMod.dll",
  canonicalSourceUrl: null,
  activeReportId: "report-1",
  contentHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  sizeBytes: 12345,
  scannerVersion: "1.2.3",
  schemaVersion: "1.2.0",
  scannedAt: "2026-04-06T12:00:00.000Z",
  classification: "Clean",
  headline: "No known threats detected",
  summary: "No known malware evidence was retained for these bytes.",
  blockingRecommended: false,
  primaryThreatFamilyId: null,
  threatFamilies: [],
  findings: [],
  findingCount: 0,
  publishedAt: "2026-04-06T12:05:00.000Z",
  revokedAt: null,
}

describe("attestation badge route", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches attestation metadata from the API and renders a badge SVG", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    )
    const cacheMatch = vi.fn().mockResolvedValue(undefined)
    const cachePut = vi.fn().mockResolvedValue(undefined)

    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("caches", {
      default: {
        match: cacheMatch,
        put: cachePut,
      },
    })

    const response = await onRequest({
      request: new Request("https://mlvscan.com/attestations/att_test/badge.svg?style=split-pill"),
      params: { shareId: "att_test" },
      env: {},
      waitUntil: () => {},
    })

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.mlvscan.com/public/attestations/att_test",
      expect.any(Object),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("image/svg+xml")
    expect(await response.text()).toContain("MLVScan attested / IL2CPP")
    expect(cacheMatch).toHaveBeenCalled()
    expect(cachePut).toHaveBeenCalled()
  })

  it("returns 404 when the API says the attestation does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    )
    vi.stubGlobal("caches", {
      default: {
        match: vi.fn().mockResolvedValue(undefined),
        put: vi.fn().mockResolvedValue(undefined),
      },
    })

    const response = await onRequest({
      request: new Request("https://mlvscan.com/attestations/missing/badge.svg"),
      params: { shareId: "missing" },
      env: {},
      waitUntil: () => {},
    })

    expect(response.status).toBe(404)
  })
})
