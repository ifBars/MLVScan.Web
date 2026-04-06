import { normalizeAttestationBadgeStyle, renderAttestationBadgeSvg } from "../../../src/lib/attestation-badge"
import { resolvePublicApiBaseUrl } from "../../../src/lib/public-api-base-url"
import type { AttestationBadgeStyle, PublicAttestationPayload } from "../../../src/types/attestation"

interface Env {
  PUBLIC_API_BASE_URL?: string
  VITE_PUBLIC_API_BASE_URL?: string
}

interface FunctionContext {
  request: Request
  params: Record<string, string | undefined>
  env: Env
  waitUntil(promise: Promise<unknown>): void
}

const BADGE_BROWSER_CACHE_TTL_SECONDS = 300
const BADGE_EDGE_CACHE_TTL_SECONDS = 3600
const BADGE_STALE_WHILE_REVALIDATE_SECONDS = 86400
const LEGACY_BADGE_STYLE_ALIASES = new Set(["attestations", "gpt-5.4", "codex-5.3", "gpt-5.2"])

function withPublicCors(headers: Headers): Headers {
  headers.set("Access-Control-Allow-Origin", "*")
  headers.set("Access-Control-Allow-Methods", "GET, HEAD")
  headers.set("Access-Control-Allow-Headers", "Content-Type")
  return headers
}

function badgeCacheControl(): string {
  return `public, max-age=${BADGE_BROWSER_CACHE_TTL_SECONDS}, s-maxage=${BADGE_EDGE_CACHE_TTL_SECONDS}, stale-while-revalidate=${BADGE_STALE_WHILE_REVALIDATE_SECONDS}`
}

function normalizeEtagValue(value: string): string {
  return value.trim().replace(/^W\//, "")
}

function requestMatchesEtag(request: Request, etag: string): boolean {
  const ifNoneMatch = request.headers.get("If-None-Match")
  if (!ifNoneMatch) {
    return false
  }

  const normalizedTarget = normalizeEtagValue(etag)
  return ifNoneMatch.split(",").some((candidate) => {
    const trimmed = candidate.trim()
    return trimmed === "*" || normalizeEtagValue(trimmed) === normalizedTarget
  })
}

function resolveRequestedBadgeStyle(value: string | null): AttestationBadgeStyle | undefined {
  if (!value) {
    return undefined
  }

  if (
    value === "ledger-strip"
    || value === "split-pill"
    || value === "classic-shield"
    || value === "signature-bar"
    || LEGACY_BADGE_STYLE_ALIASES.has(value)
  ) {
    return normalizeAttestationBadgeStyle(value)
  }

  return undefined
}

function resolveApiBaseUrl(request: Request, env: Env): string {
  const url = new URL(request.url)
  return resolvePublicApiBaseUrl({
    configuredBaseUrl: env.PUBLIC_API_BASE_URL ?? env.VITE_PUBLIC_API_BASE_URL,
    origin: url.origin,
    hostname: url.hostname,
  })
}

async function createBadgeEtag(
  payload: PublicAttestationPayload,
  badgeStyleOverride?: string,
): Promise<string> {
  const fingerprint = JSON.stringify({
    shareId: payload.shareId,
    publicationStatus: payload.publicationStatus,
    sourceBindingStatus: payload.sourceBindingStatus,
    badgeStyle: badgeStyleOverride ?? payload.badge?.style ?? payload.badgeStyle,
    badge: payload.badge ?? null,
    activeReportId: payload.activeReportId,
    contentHash: payload.contentHash,
    schemaVersion: payload.schemaVersion,
    scannerVersion: payload.scannerVersion,
    scannedAt: payload.scannedAt,
    classification: payload.classification,
    findingCount: payload.findingCount,
    publishedAt: payload.publishedAt,
    revokedAt: payload.revokedAt,
  })
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fingerprint))
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
  return `W/"${hash}"`
}

function notFoundResponse(): Response {
  return new Response("Not found", {
    status: 404,
    headers: withPublicCors(
      new Headers({
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      }),
    ),
  })
}

export const onRequest = async (context: FunctionContext): Promise<Response> => {
  const cacheStorage = caches as CacheStorage & { default: Cache }
  const shareId = typeof context.params.shareId === "string" ? context.params.shareId : ""
  if (!shareId) {
    return notFoundResponse()
  }

  const cachedResponse = await cacheStorage.default.match(context.request)
  if (cachedResponse) {
    return cachedResponse
  }

  const apiBaseUrl = resolveApiBaseUrl(context.request, context.env)
  const attestationResponse = await fetch(
    `${apiBaseUrl}/public/attestations/${encodeURIComponent(shareId)}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  )

  if (attestationResponse.status === 404) {
    return notFoundResponse()
  }

  if (!attestationResponse.ok) {
    return new Response("Badge metadata unavailable", {
      status: 502,
      headers: withPublicCors(
        new Headers({
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        }),
      ),
    })
  }

  const payload = (await attestationResponse.json()) as PublicAttestationPayload
  const badgeStyle = resolveRequestedBadgeStyle(new URL(context.request.url).searchParams.get("style"))
  const etag = await createBadgeEtag(payload, badgeStyle)
  const headers = withPublicCors(
    new Headers({
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": badgeCacheControl(),
      ETag: etag,
      Vary: "Accept-Encoding",
    }),
  )

  if (requestMatchesEtag(context.request, etag)) {
    return new Response(null, { status: 304, headers })
  }

  if (context.request.method === "HEAD") {
    return new Response(null, { status: 200, headers })
  }

  const response = new Response(renderAttestationBadgeSvg(payload, badgeStyle), {
    status: 200,
    headers,
  })
  context.waitUntil(cacheStorage.default.put(context.request, response.clone()))
  return response
}
