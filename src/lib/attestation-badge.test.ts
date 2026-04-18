import { describe, expect, it } from "vitest"

import {
  createAttestationBadgeSlotsDraft,
  legacyDisplayToSlots,
  renderAttestationBadgeSvg,
  resolveAttestationBadgeMetadata,
} from "./attestation-badge"
import type { PublicAttestationPayload } from "../types/attestation"

const basePayload: PublicAttestationPayload = {
  shareId: "att_test",
  verificationTier: "self_submitted",
  publicationStatus: "published",
  sourceBindingStatus: "none",
  badgeStyle: "split-pill",
  publicDisplayName: "Sample Mod",
  artifactKey: "sample-mod",
  artifactVersion: "1.0.0",
  isCurrent: true,
  supersededAt: null,
  supersededByAttestationId: null,
  supersededByShareId: null,
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

function svgWidth(svg: string): number {
  const match = svg.match(/<svg[^>]* width="(\d+)"/)
  return match ? Number(match[1]) : 0
}

describe("attestation badge metadata", () => {
  it("derives badge metadata when the API has not provided badge metadata yet", () => {
    const metadata = resolveAttestationBadgeMetadata(basePayload)

    expect(metadata.style).toBe("split-pill")
    expect(metadata.density).toBe("compact")
    expect(metadata.brand.label).toBe("Attested")
  })

  it("renders runtime metadata inside the badge when provided", () => {
    const svg = renderAttestationBadgeSvg(
      {
        ...basePayload,
        badge: {
          schemaVersion: "badge.v2",
          style: "split-pill",
          density: "compact",
          slots: { runtime: true, leftDetail: "none", rightDetail: "none" },
          brand: { kind: "mlvscan-check", label: "MLVScan attested" },
          tone: "clean",
          statusLabel: "Clean",
          fileLabel: "SampleMod.dll",
          verificationLabel: "Self-submitted",
          runtimeLabel: "IL2CPP",
          sourceBindingLabel: "No source",
          versionLabel: "1.0.0",
          scannedDateLabel: "2026-04-06",
          shortHashLabel: "89abcdef",
        },
      },
      "compact",
    )

    expect(svg).toContain("Attested / IL2CPP")
    expect(svg).toContain("Clean")
    expect(svg.indexOf(">Clean<")).toBeLessThan(svg.indexOf(">Attested / IL2CPP<"))
    expect(svg).toContain('width="18" height="18"')
  })

  it("keeps the compact short-label badge tight", () => {
    const svg = renderAttestationBadgeSvg(basePayload, "compact")

    expect(svg).toContain(">Clean<")
    expect(svg).toContain(">Attested<")
    expect(svgWidth(svg)).toBeLessThanOrEqual(140)
  })

  it("splits detailed metadata across the left and right badge segments", () => {
    const svg = renderAttestationBadgeSvg(
      {
        ...basePayload,
        badge: {
          schemaVersion: "badge.v2",
          style: "split-pill",
          density: "detailed",
          slots: { runtime: true, leftDetail: "verification", rightDetail: "version" },
          brand: { kind: "mlvscan-check", label: "MLVScan attested" },
          tone: "clean",
          statusLabel: "Clean",
          fileLabel: "SampleMod.dll",
          verificationLabel: "Self-submitted",
          runtimeLabel: "Mono",
          sourceBindingLabel: "No source",
          versionLabel: "1.0.0",
          scannedDateLabel: "2026-04-06",
          shortHashLabel: "89abcdef",
        },
      },
      "detailed",
    )

    expect(svg).toContain("Clean | Self-submitted")
    expect(svg).toContain("Attested / Mono | 1.0")
    expect(svgWidth(svg)).toBeLessThanOrEqual(340)
  })

  it("compacts optional detail slots before dropping core brand or runtime text", () => {
    const svg = renderAttestationBadgeSvg(
      {
        ...basePayload,
        badge: {
          schemaVersion: "badge.v2",
          style: "split-pill",
          density: "detailed",
          slots: { runtime: true, leftDetail: "verification", rightDetail: "scanned-date" },
          brand: { kind: "mlvscan-check", label: "MLVScan attested" },
          tone: "clean",
          statusLabel: "Clean",
          fileLabel: "SampleMod.dll",
          verificationLabel: "Self-submitted",
          runtimeLabel: "IL2CPP",
          sourceBindingLabel: "No source",
          versionLabel: "1.0.0",
          scannedDateLabel: "2026-03-26",
          shortHashLabel: "89abcdef",
        },
      },
      "detailed",
    )

    expect(svg).toContain("Clean | Self")
    expect(svg).toContain("Attested / IL2CPP | 2026-03")
    expect(svg).not.toContain("MLVScan | 2026-03")
    expect(svgWidth(svg)).toBeLessThanOrEqual(340)
  })

  it("converts legacy displays into detailed slots", () => {
    expect(legacyDisplayToSlots("detailed", {
      showRuntime: true,
      showVerification: true,
      showFile: false,
      showScannedDate: true,
      showShortHash: false,
    })).toEqual({
      runtime: true,
      leftDetail: "verification",
      rightDetail: "scanned-date",
    })
  })

  it("sanitizes draft slots by density", () => {
    expect(createAttestationBadgeSlotsDraft("compact", {
      runtime: true,
      leftDetail: "verification",
      rightDetail: "version",
    })).toEqual({
      runtime: true,
      leftDetail: "none",
      rightDetail: "none",
    })
  })
})
