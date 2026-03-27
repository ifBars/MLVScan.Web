import type { PublicAttestationPayload } from "@/types/attestation"
import { resolvePublicApiBaseUrl } from "@/lib/public-api-base-url"

export class PublicAttestationNotFoundError extends Error {
  constructor(shareId: string) {
    super(`Public attestation not found: ${shareId}`)
    this.name = "PublicAttestationNotFoundError"
  }
}

export function resolvePublicAttestationApiBaseUrl(): string {
  return resolvePublicApiBaseUrl({
    configuredBaseUrl: import.meta.env.VITE_PUBLIC_API_BASE_URL,
  })
}

export function buildAttestationBadgeUrl(shareId: string): string {
  return `${resolvePublicAttestationApiBaseUrl()}/public/attestations/${encodeURIComponent(shareId)}/badge.svg`
}

export function buildSignedAttestationUrl(shareId: string): string {
  return `${resolvePublicAttestationApiBaseUrl()}/public/attestations/${encodeURIComponent(shareId)}/attestation.json`
}

export async function fetchPublicAttestation(
  shareId: string,
  signal?: AbortSignal,
): Promise<PublicAttestationPayload> {
  const response = await fetch(
    `${resolvePublicAttestationApiBaseUrl()}/public/attestations/${encodeURIComponent(shareId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    },
  )

  if (response.status === 404) {
    throw new PublicAttestationNotFoundError(shareId)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown parse failure"
    throw new Error(`Failed to parse public attestation (${response.status}): ${message}`)
  }

  if (!response.ok) {
    const errorMessage =
      isRecord(body) && typeof body.error === "string"
        ? body.error
        : `Failed to load public attestation (${response.status})`
    throw new Error(errorMessage)
  }

  if (!isPublicAttestationPayload(body)) {
    throw new Error(
      `Public attestation response was missing required fields (${response.status})`,
    )
  }

  return body
}

function isPublicAttestationPayload(value: unknown): value is PublicAttestationPayload {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.shareId === "string" &&
    typeof value.publicDisplayName === "string" &&
    typeof value.fileName === "string" &&
    typeof value.activeReportId === "string" &&
    typeof value.contentHash === "string" &&
    typeof value.sizeBytes === "number" &&
    typeof value.scannerVersion === "string" &&
    typeof value.schemaVersion === "string" &&
    typeof value.scannedAt === "string" &&
    typeof value.headline === "string" &&
    typeof value.summary === "string" &&
    typeof value.blockingRecommended === "boolean" &&
    typeof value.findingCount === "number" &&
    (value.canonicalSourceUrl === null || typeof value.canonicalSourceUrl === "string") &&
    (value.primaryThreatFamilyId === null || typeof value.primaryThreatFamilyId === "string") &&
    (value.publishedAt === null || typeof value.publishedAt === "string") &&
    (value.revokedAt === null || typeof value.revokedAt === "string") &&
    Array.isArray(value.threatFamilies) &&
    Array.isArray(value.findings) &&
    isVerificationTier(value.verificationTier) &&
    isPublicationStatus(value.publicationStatus) &&
    isSourceBindingStatus(value.sourceBindingStatus) &&
    isAttestationBadgeStyle(value.badgeStyle) &&
    isThreatDispositionClassification(value.classification)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isVerificationTier(value: unknown): value is PublicAttestationPayload["verificationTier"] {
  return value === "self_submitted" || value === "source_verified"
}

function isPublicationStatus(value: unknown): value is PublicAttestationPayload["publicationStatus"] {
  return value === "draft" || value === "published" || value === "revoked"
}

function isSourceBindingStatus(
  value: unknown,
): value is PublicAttestationPayload["sourceBindingStatus"] {
  return value === "none" || value === "declared" || value === "verified" || value === "stale" || value === "failed"
}

function isAttestationBadgeStyle(value: unknown): value is PublicAttestationPayload["badgeStyle"] {
  return value === "ledger-strip" || value === "split-pill" || value === "classic-shield" || value === "signature-bar"
}

function isThreatDispositionClassification(
  value: unknown,
): value is PublicAttestationPayload["classification"] {
  return value === "Clean" || value === "Suspicious" || value === "KnownThreat"
}
