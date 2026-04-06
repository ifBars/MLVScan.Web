import { afterEach, describe, expect, it, vi } from "vitest"

import {
  PublicAttestationNotFoundError,
  buildAttestationBadgeUrl,
  fetchPublicAttestation,
} from "./attestation-api"
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

describe("attestation-api", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("builds badge URLs on the site origin instead of the API origin", () => {
    expect(buildAttestationBadgeUrl("att_test")).toBe(
      "http://localhost:3000/attestations/att_test/badge.svg",
    )
  })

  it("accepts attestation payloads that include badge metadata", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchPublicAttestation("att_test")

    expect(result.badge?.runtimeLabel).toBe("IL2CPP")
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/public/attestations/att_test",
      expect.objectContaining({
        method: "GET",
      }),
    )
  })

  it("throws a not-found error for missing public attestations", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })))

    await expect(fetchPublicAttestation("missing-share")).rejects.toBeInstanceOf(
      PublicAttestationNotFoundError,
    )
  })
})
