export type PublicReportClassification = "Clean" | "Suspicious" | "KnownThreat"

export interface PublicReportFinding {
  id: string | null
  ruleId: string | null
  description: string
  severity: string
  location: string | null
  visibility: "Default" | "Advanced"
}

export interface PublicReportThreatFamily {
  familyId: string
  variantId: string | null
  displayName: string
  summary: string
  matchKind: string
  confidence: number | null
  exactHashMatch: boolean
  matchedRules: string[]
  advisorySlugs: string[]
}

export interface PublicReportSource {
  provider: string
  game: string
  sourceKey: string
  displayName: string | null
  author: string | null
  version: string | null
  fileName: string | null
  packageFileName: string | null
  sourceUrl: string | null
}

export interface PublicRelatedReport {
  submissionId: string
  reportId: string
  fileName: string
  contentHash: string | null
  schemaVersion: string | null
  status: "pending" | "processing" | "completed" | "failed"
  classification: PublicReportClassification
  findingCount: number
  createdAt: string
  current: boolean
}

export interface PublicReportPayload {
  submissionId: string
  reportId: string
  status: "pending" | "processing" | "completed" | "failed"
  source: PublicReportSource
  fileName: string
  contentHash: string | null
  sizeBytes: number | null
  scannerVersion: string | null
  schemaVersion: string
  scannedAt: string
  classification: PublicReportClassification
  headline: string
  summary: string
  blockingRecommended: boolean
  primaryThreatFamilyId: string | null
  threatFamilies: PublicReportThreatFamily[]
  findings: PublicReportFinding[]
  findingCount: number
  triggeredRules: string[]
  relatedReports: PublicRelatedReport[]
}
