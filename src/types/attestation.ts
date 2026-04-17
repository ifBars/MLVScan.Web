export type VerificationTier = "self_submitted" | "source_verified"
export type PublicationStatus = "draft" | "published" | "superseded" | "revoked"
export type SourceBindingStatus = "none" | "declared" | "verified" | "stale" | "failed"
export type ThreatDispositionClassification = "Clean" | "Suspicious" | "KnownThreat"
export type AttestationBadgeStyle = "split-pill"
export type BadgeDensity = "compact" | "detailed"
export type BadgeDetailSlot =
  | "none"
  | "verification"
  | "source-binding"
  | "version"
  | "scanned-date"
export type AttestationBadgeTone =
  | "clean"
  | "suspicious"
  | "known-threat"
  | "revoked"

export interface AttestationBadgeSlots {
  runtime: boolean
  leftDetail: BadgeDetailSlot
  rightDetail: BadgeDetailSlot
}

export interface AttestationBadgeDisplay {
  showRuntime: boolean
  showVerification: boolean
  showFile: boolean
  showScannedDate: boolean
  showShortHash: boolean
}

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

export interface PublicAttestationBadgeMetadata {
  schemaVersion: "badge.v2"
  style: AttestationBadgeStyle
  density: BadgeDensity
  slots: AttestationBadgeSlots
  brand: {
    kind: "mlvscan-check"
    label: string
  }
  tone: AttestationBadgeTone
  statusLabel: string
  fileLabel: string
  verificationLabel: string
  runtimeLabel: string | null
  sourceBindingLabel: string
  versionLabel: string | null
  scannedDateLabel: string
  shortHashLabel: string
  display?: AttestationBadgeDisplay
}

export interface PublicAttestationPayload {
  shareId: string
  verificationTier: VerificationTier
  publicationStatus: PublicationStatus
  sourceBindingStatus: SourceBindingStatus
  badgeStyle: AttestationBadgeStyle
  badge?: PublicAttestationBadgeMetadata
  publicDisplayName: string
  artifactKey: string
  artifactVersion: string | null
  isCurrent: boolean
  supersededAt: string | null
  supersededByAttestationId: string | null
  supersededByShareId: string | null
  fileName: string
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
