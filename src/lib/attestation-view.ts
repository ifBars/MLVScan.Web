import type {
  PublicationStatus,
  SourceBindingStatus,
  ThreatDispositionClassification,
  VerificationTier,
} from "@/types/attestation"

export type AttestationTone = "clean" | "suspicious" | "threat" | "revoked"

export function getAttestationTone(
  classification: ThreatDispositionClassification,
  publicationStatus: PublicationStatus,
): AttestationTone {
  if (publicationStatus === "revoked") return "revoked"
  if (classification === "KnownThreat") return "threat"
  if (classification === "Suspicious") return "suspicious"
  return "clean"
}

export function getAttestationVerdictLabel(
  classification: ThreatDispositionClassification,
  publicationStatus: PublicationStatus,
): string {
  if (publicationStatus === "revoked") return "Attestation revoked"
  if (classification === "KnownThreat") return "Known threat"
  if (classification === "Suspicious") return "Suspicious"
  return "No known threats detected"
}

export function getSourceBindingLabel(status: SourceBindingStatus): string {
  switch (status) {
    case "declared":
      return "Declared source URL"
    case "verified":
      return "Verified source"
    case "stale":
      return "Source stale"
    case "failed":
      return "Source verification failed"
    case "none":
    default:
      return "No bound source"
  }
}

export function getVerificationTierLabel(tier: VerificationTier): string {
  return tier === "source_verified" ? "Source-verified scan" : "Self-submitted scan"
}

export function shortenHash(hash: string): string {
  if (hash.length <= 24) return hash
  return `${hash.slice(0, 14)}...${hash.slice(-10)}`
}
