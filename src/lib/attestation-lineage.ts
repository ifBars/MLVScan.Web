import type { PublicationStatus } from "@/types/attestation"
import type { PartnerAttestationSummary } from "@/types/partner-dashboard"

type AttestationLineageRecord = Pick<
  PartnerAttestationSummary,
  "id" | "artifactKey" | "publicationStatus" | "isCurrent"
>

export function isCurrentAttestation(
  attestation: Pick<PartnerAttestationSummary, "publicationStatus" | "isCurrent">,
): boolean {
  return attestation.publicationStatus === "published" && attestation.isCurrent
}

export function isPublicAttestation(
  attestation: Pick<PartnerAttestationSummary, "publicationStatus">,
): boolean {
  return attestation.publicationStatus !== "draft"
}

export function getAttestationStatusLabel(
  attestation: Pick<PartnerAttestationSummary, "publicationStatus" | "isCurrent">,
): PublicationStatus | "current" {
  if (isCurrentAttestation(attestation)) {
    return "current"
  }

  return attestation.publicationStatus
}

export function getAttestationStatusDescription(
  attestation: Pick<PartnerAttestationSummary, "artifactKey" | "publicationStatus" | "isCurrent">,
): string {
  if (attestation.publicationStatus === "draft") {
    return `Not public yet. Publish makes this the current record for ${attestation.artifactKey}.`
  }

  if (isCurrentAttestation(attestation)) {
    return `Current attestation for ${attestation.artifactKey}.`
  }

  if (attestation.publicationStatus === "superseded") {
    return `Replaced by a newer current attestation for ${attestation.artifactKey}.`
  }

  return `Revoked history for ${attestation.artifactKey}. This page is no longer an active trust signal.`
}

export function countCurrentAttestations(
  attestations: ReadonlyArray<Pick<PartnerAttestationSummary, "publicationStatus" | "isCurrent">>,
): number {
  return attestations.filter(isCurrentAttestation).length
}

export function countSupersededAttestations(
  attestations: ReadonlyArray<Pick<PartnerAttestationSummary, "publicationStatus">>,
): number {
  return attestations.filter(
    (attestation) => attestation.publicationStatus === "superseded",
  ).length
}

export function findCurrentAttestationForArtifactKey<T extends AttestationLineageRecord>(
  attestations: ReadonlyArray<T>,
  artifactKey: string,
  excludeId?: string | null,
): T | null {
  return (
    attestations.find((attestation) =>
      attestation.artifactKey === artifactKey
      && attestation.id !== excludeId
      && isCurrentAttestation(attestation),
    ) ?? null
  )
}
