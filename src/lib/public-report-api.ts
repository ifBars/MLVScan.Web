import { resolvePublicApiBaseUrl } from "@/lib/public-api-base-url"
import type { PublicReportPayload } from "@/types/public-report"

export class PublicReportNotFoundError extends Error {
  constructor(submissionId: string) {
    super(`Public report not found: ${submissionId}`)
    this.name = "PublicReportNotFoundError"
  }
}

export function resolvePublicReportApiBaseUrl(): string {
  return resolvePublicApiBaseUrl({
    configuredBaseUrl: import.meta.env.VITE_PUBLIC_API_BASE_URL,
  })
}

export async function fetchPublicReport(
  submissionId: string,
  signal?: AbortSignal,
): Promise<PublicReportPayload> {
  const response = await fetch(
    `${resolvePublicReportApiBaseUrl()}/public/reports/${encodeURIComponent(submissionId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    },
  )

  if (response.status === 404) {
    throw new PublicReportNotFoundError(submissionId)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown parse failure"
    throw new Error(`Failed to parse public report (${response.status}): ${message}`)
  }

  if (!response.ok) {
    const errorMessage =
      isRecord(body) && typeof body.error === "string"
        ? body.error
        : `Failed to load public report (${response.status})`
    throw new Error(errorMessage)
  }

  if (!isPublicReportPayload(body)) {
    throw new Error(`Public report response was missing required fields (${response.status})`)
  }

  return body
}

function isPublicReportPayload(value: unknown): value is PublicReportPayload {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.submissionId === "string" &&
    typeof value.reportId === "string" &&
    isReportStatus(value.status) &&
    isPublicReportSource(value.source) &&
    typeof value.fileName === "string" &&
    (value.contentHash === null || typeof value.contentHash === "string") &&
    (value.sizeBytes === null || typeof value.sizeBytes === "number") &&
    (value.scannerVersion === null || typeof value.scannerVersion === "string") &&
    typeof value.schemaVersion === "string" &&
    typeof value.scannedAt === "string" &&
    isClassification(value.classification) &&
    typeof value.headline === "string" &&
    typeof value.summary === "string" &&
    typeof value.blockingRecommended === "boolean" &&
    (value.primaryThreatFamilyId === null || typeof value.primaryThreatFamilyId === "string") &&
    Array.isArray(value.threatFamilies) &&
    Array.isArray(value.findings) &&
    typeof value.findingCount === "number" &&
    Array.isArray(value.triggeredRules) &&
    Array.isArray(value.relatedReports) &&
    value.relatedReports.every(isPublicRelatedReport) &&
    (!("reviewOverride" in value) || value.reviewOverride === null || isPublicReviewOverride(value.reviewOverride))
  )
}

function isPublicReportSource(value: unknown): boolean {
  return isRecord(value) &&
    typeof value.provider === "string" &&
    typeof value.game === "string" &&
    typeof value.sourceKey === "string" &&
    (value.displayName === null || typeof value.displayName === "string") &&
    (value.author === null || typeof value.author === "string") &&
    (value.version === null || typeof value.version === "string") &&
    (value.fileName === null || typeof value.fileName === "string") &&
    (value.packageFileName === null || typeof value.packageFileName === "string") &&
    (value.sourceUrl === null || typeof value.sourceUrl === "string")
}

function isPublicRelatedReport(value: unknown): boolean {
  return isRecord(value) &&
    typeof value.submissionId === "string" &&
    typeof value.reportId === "string" &&
    typeof value.fileName === "string" &&
    (value.contentHash === null || typeof value.contentHash === "string") &&
    (value.schemaVersion === null || typeof value.schemaVersion === "string") &&
    isReportStatus(value.status) &&
    isClassification(value.classification) &&
    typeof value.findingCount === "number" &&
    typeof value.createdAt === "string" &&
    typeof value.current === "boolean"
}

function isPublicReviewOverride(value: unknown): boolean {
  return isRecord(value) &&
    typeof value.id === "string" &&
    (value.reviewStatus === "false_positive" || value.reviewStatus === "allowed" || value.reviewStatus === "needs_admin_review") &&
    isClassification(value.classification) &&
    typeof value.headline === "string" &&
    typeof value.summary === "string" &&
    typeof value.blockingRecommended === "boolean" &&
    typeof value.reason === "string" &&
    typeof value.reviewedAt === "string" &&
    typeof value.reviewedBy === "string" &&
    (!("reviewedByDiscordUserId" in value) || value.reviewedByDiscordUserId === null || typeof value.reviewedByDiscordUserId === "string") &&
    (value.scopeKind === "hash" || value.scopeKind === "report" || value.scopeKind === "submission" || value.scopeKind === "source_artifact")
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isReportStatus(value: unknown): boolean {
  return value === "pending" || value === "processing" || value === "completed" || value === "failed"
}

function isClassification(value: unknown): boolean {
  return value === "Clean" || value === "Suspicious" || value === "KnownThreat"
}
