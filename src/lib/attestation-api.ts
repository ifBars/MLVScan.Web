import type { PublicAttestationPayload } from "@/types/attestation"

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "")
}

export class PublicAttestationNotFoundError extends Error {
  constructor(shareId: string) {
    super(`Public attestation not found: ${shareId}`)
    this.name = "PublicAttestationNotFoundError"
  }
}

export function resolvePublicAttestationApiBaseUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_API_BASE_URL?.trim()
  if (configured) {
    return trimTrailingSlashes(configured)
  }

  if (typeof window !== "undefined") {
    return trimTrailingSlashes(window.location.origin)
  }

  return ""
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

  const body = (await response.json().catch(() => ({}))) as Partial<PublicAttestationPayload> & {
    error?: string
  }

  if (!response.ok) {
    throw new Error(body.error ?? `Failed to load public attestation (${response.status})`)
  }

  return body as PublicAttestationPayload
}
