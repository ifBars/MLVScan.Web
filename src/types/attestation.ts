export type VerificationTier = "self_submitted" | "source_verified"
export type PublicationStatus = "draft" | "published" | "revoked"
export type SourceBindingStatus = "none" | "declared" | "verified" | "stale" | "failed"
export type ThreatDispositionClassification = "Clean" | "Suspicious" | "KnownThreat"

export interface PublicAttestationFinding {
  id: string | null
  ruleId: string | null
  description: string
  severity: string
  location: string | null
  visibility: "Default" | "Advanced"
}

export interface PublicAttestationThreatFamily {
  familyId: string
  variantId: string | null
  displayName: string
  summary: string
  matchKind: string
  confidence: number | null
  exactHashMatch: boolean
  matchedRules: string[]
  advisorySlugs: string[]
  evidence: Array<Record<string, unknown>>
}

export interface PublicAttestationPayload {
  shareId: string
  verificationTier: VerificationTier
  publicationStatus: PublicationStatus
  sourceBindingStatus: SourceBindingStatus
  publicDisplayName: string
  canonicalSourceUrl: string | null
  activeReportId: string
  contentHash: string
  sizeBytes: number
  scannerVersion: string
  schemaVersion: string
  scannedAt: string
  classification: ThreatDispositionClassification
  headline: string
  summary: string
  blockingRecommended: boolean
  primaryThreatFamilyId: string | null
  threatFamilies: PublicAttestationThreatFamily[]
  findings: PublicAttestationFinding[]
  findingCount: number
  publishedAt: string | null
  revokedAt: string | null
}

export interface SignedAttestationDocument {
  algorithm: "HS256"
  keyId: string
  signedAt: string
  payload: PublicAttestationPayload
  signature: string
}
