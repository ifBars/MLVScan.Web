import { describe, expect, it } from "vitest"

import {
  renderAttestationBadgeSvg,
  resolveAttestationBadgeMetadata,
} from "./attestation-badge"
import type { PublicAttestationPayload } from "../types/attestation"

const basePayload: PublicAttestationPayload = {
  shareId: "att_test",
  verificationTier: "self_submitted",
  publicationStatus: "published",
  sourceBindingStatus: "none",
  badgeStyle: "ledger-strip",
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

describe("attestation badge metadata", () => {
  it("derives fallback metadata when the API has not provided badge metadata yet", () => {
    const metadata = resolveAttestationBadgeMetadata(basePayload)

    expect(metadata.brand.label).toBe("MLVScan attested")
    expect(metadata.statusLabel).toBe("Clean")
    expect(metadata.runtimeLabel).toBeNull()
    expect(metadata.shortHashLabel).toBe("89abcdef")
  })

  it("renders runtime metadata inside the split-pill badge when provided", () => {
    const svg = renderAttestationBadgeSvg(
      {
        ...basePayload,
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
      },
      "split-pill",
    )

    expect(svg).toContain("MLVScan attested / IL2CPP")
    expect(svg).toContain(">Clean<")
  })
})
