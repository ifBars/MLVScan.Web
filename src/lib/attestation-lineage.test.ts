import { describe, expect, it } from "vitest"

import {
  countCurrentAttestations,
  countSupersededAttestations,
  findCurrentAttestationForArtifactKey,
  getAttestationStatusDescription,
  getAttestationStatusLabel,
  isCurrentAttestation,
  isPublicAttestation,
} from "@/lib/attestation-lineage"
import type { PartnerAttestationSummary } from "@/types/partner-dashboard"

const baseAttestation: PartnerAttestationSummary = {
  id: "attestation-1",
  shareId: "att_test",
  verificationTier: "self_submitted",
  publicationStatus: "published",
  sourceBindingStatus: "none",
  badgeStyle: "split-pill",
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
  createdAt: "2026-04-06T12:05:00.000Z",
  refreshedAt: null,
  publicUrl: "https://mlvscan.test/attestations/att_test",
  badgeUrl: "https://mlvscan.test/attestations/att_test/badge.svg",
}

describe("attestation-lineage", () => {
  it("treats current and superseded as distinct lineage states", () => {
    const current = baseAttestation
    const superseded = {
      ...baseAttestation,
      id: "attestation-2",
      publicationStatus: "superseded" as const,
      isCurrent: false,
      supersededAt: "2026-04-07T12:05:00.000Z",
      supersededByAttestationId: "attestation-3",
      supersededByShareId: "att_current",
    }
    const revoked = {
      ...baseAttestation,
      id: "attestation-4",
      publicationStatus: "revoked" as const,
      isCurrent: false,
      revokedAt: "2026-04-07T13:05:00.000Z",
    }
    const draft = {
      ...baseAttestation,
      id: "attestation-5",
      publicationStatus: "draft" as const,
      isCurrent: false,
      publishedAt: null,
      revokedAt: null,
    }

    expect(isCurrentAttestation(current)).toBe(true)
    expect(isPublicAttestation(current)).toBe(true)
    expect(getAttestationStatusLabel(current)).toBe("current")
    expect(getAttestationStatusDescription(current)).toBe(
      "Current attestation for sample-mod.",
    )

    expect(getAttestationStatusLabel(superseded)).toBe("superseded")
    expect(getAttestationStatusDescription(superseded)).toBe(
      "Replaced by a newer current attestation for sample-mod.",
    )
    expect(isPublicAttestation(superseded)).toBe(true)

    expect(getAttestationStatusLabel(revoked)).toBe("revoked")
    expect(isPublicAttestation(revoked)).toBe(true)

    expect(getAttestationStatusLabel(draft)).toBe("draft")
    expect(isPublicAttestation(draft)).toBe(false)

    expect(countCurrentAttestations([current, superseded, revoked, draft])).toBe(1)
    expect(countSupersededAttestations([current, superseded, revoked, draft])).toBe(1)
  })

  it("finds the current attestation for a lineage by artifact key", () => {
    const current = baseAttestation
    const superseded = {
      ...baseAttestation,
      id: "attestation-2",
      shareId: "att_old",
      publicationStatus: "superseded" as const,
      isCurrent: false,
      publishedAt: "2026-04-05T12:05:00.000Z",
      supersededAt: "2026-04-06T12:05:00.000Z",
      supersededByAttestationId: current.id,
      supersededByShareId: current.shareId,
    }

    expect(findCurrentAttestationForArtifactKey([superseded, current], "sample-mod")).toEqual(current)
    expect(findCurrentAttestationForArtifactKey([superseded], "sample-mod")).toBeNull()
  })
})
