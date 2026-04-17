import type {
  PartnerBadgePreferencesInput,
  PartnerAttestationBadgeConfigInput,
  PartnerAttestationMetadataInput,
  PartnerAttestationBadgeStyleInput,
  PartnerAttestationDraftInput,
  PartnerAttestationSummary,
  PartnerAuthProviders,
  PartnerCreateKeyInput,
  PartnerCreateKeyResponse,
  PartnerReportResponse,
  PartnerRotateKeyResponse,
  PartnerSubmissionMetadata,
  PartnerSessionResponse,
  PartnerUploadResponse,
  PartnerUploadUrlResponse,
  PartnerApiKey,
  PartnerProfile,
} from "@/types/partner-dashboard"
import { resolvePublicApiBaseUrl } from "@/lib/public-api-base-url"

// Keep direct dashboard uploads under the buffered multipart Worker path.
// Larger browser uploads should go straight to R2 via a presigned URL.
const FILES_SIZE_LIMIT_BYTES = 32 * 1024 * 1024

interface ApiErrorBody {
  error?: string
  message?: string
  csrfToken?: string
}

let csrfToken: string | null = null

function resolveApiBaseUrl(): string {
  return resolvePublicApiBaseUrl({
    configuredBaseUrl: import.meta.env.VITE_PUBLIC_API_BASE_URL,
  })
}

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const baseUrl = resolveApiBaseUrl()
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath
}

function isMutation(method: string): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(method)
}

function extractErrorMessage(body: ApiErrorBody, response: Response): string {
  return body.error ?? body.message ?? `Request failed (${response.status})`
}

function updateCsrfToken(body: ApiErrorBody | PartnerSessionResponse): void {
  if (typeof body.csrfToken === "string" && body.csrfToken.length > 0) {
    csrfToken = body.csrfToken
  }
}

async function readJson(response: Response): Promise<ApiErrorBody> {
  return (await response.json().catch(() => ({}))) as ApiErrorBody
}

async function requestApi<T>(
  path: string,
  init: RequestInit = {},
  options: { includeCsrf?: boolean; credentials?: RequestCredentials } = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase()
  const headers = new Headers(init.headers)
  const body = init.body

  headers.set("Accept", "application/json")

  if (body !== undefined && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (options.includeCsrf !== false && isMutation(method) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken)
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    credentials: options.credentials ?? "include",
    headers,
  })
  const responseBody = await readJson(response)

  if (response.status === 401) {
    throw new PartnerUnauthorizedError(extractErrorMessage(responseBody, response))
  }

  if (response.status === 404) {
    throw new PartnerNotFoundError(extractErrorMessage(responseBody, response))
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(responseBody, response))
  }

  updateCsrfToken(responseBody)
  return responseBody as T
}

async function requestUploadApi<T>(path: string, init: RequestInit): Promise<T> {
  return requestApi<T>(path, init, { includeCsrf: false })
}

export class PartnerUnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message)
    this.name = "PartnerUnauthorizedError"
  }
}

export class PartnerNotFoundError extends Error {
  constructor(message = "Not found") {
    super(message)
    this.name = "PartnerNotFoundError"
  }
}

export function clearPartnerDashboardSessionState(): void {
  csrfToken = null
}

export function buildPartnerAuthUrl(path: string): string {
  return buildApiUrl(path)
}

export function getFilesSizeLimitBytes(): number {
  return FILES_SIZE_LIMIT_BYTES
}

export async function getPartnerAuthProviders(signal?: AbortSignal): Promise<PartnerAuthProviders> {
  return requestApi<PartnerAuthProviders>("/partner/auth/providers", { signal }, { includeCsrf: false })
}

export async function getPartnerSession(signal?: AbortSignal): Promise<PartnerSessionResponse> {
  return requestApi<PartnerSessionResponse>("/partner/auth/session", { signal })
}

export async function loginWithSharedKey(
  username: string,
  key: string,
): Promise<PartnerSessionResponse> {
  return requestApi<PartnerSessionResponse>("/partner/auth/shared-key/login", {
    method: "POST",
    body: JSON.stringify({ username, key }),
  }, { includeCsrf: false })
}

export async function logoutPartner(): Promise<void> {
  await requestApi<{ success: boolean }>("/partner/auth/logout", {
    method: "POST",
  })
  clearPartnerDashboardSessionState()
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function sanitizeDraftInput(input: PartnerAttestationDraftInput): PartnerAttestationDraftInput {
  const sanitizedMetadata = sanitizeAttestationMetadataInput(input)

  return {
    ...input,
    ...sanitizedMetadata,
  }
}

function sanitizeAttestationMetadataInput(
  input: PartnerAttestationMetadataInput,
): PartnerAttestationMetadataInput {
  const artifactVersion = normalizeOptionalString(input.artifactVersion)
  const publicDisplayName = normalizeOptionalString(input.publicDisplayName)
  const canonicalSourceUrl = normalizeOptionalString(input.canonicalSourceUrl)

  return {
    artifactKey: input.artifactKey.trim(),
    artifactVersion,
    publicDisplayName,
    canonicalSourceUrl,
  }
}

export async function listPartnerApiKeys(signal?: AbortSignal): Promise<PartnerApiKey[]> {
  const response = await requestApi<{ keys: PartnerApiKey[] }>("/account/api-keys", { signal })
  return response.keys ?? []
}

export async function createPartnerApiKey(
  input: PartnerCreateKeyInput,
): Promise<PartnerCreateKeyResponse> {
  return requestApi<PartnerCreateKeyResponse>("/account/api-keys", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function rotatePartnerApiKey(id: string): Promise<PartnerRotateKeyResponse> {
  return requestApi<PartnerRotateKeyResponse>(`/account/api-keys/${encodeURIComponent(id)}/rotate`, {
    method: "POST",
  })
}

export async function revokePartnerApiKey(id: string): Promise<void> {
  await requestApi<{ success: boolean }>(`/account/api-keys/${encodeURIComponent(id)}/revoke`, {
    method: "POST",
  })
}

export async function listPartnerAttestations(signal?: AbortSignal): Promise<PartnerAttestationSummary[]> {
  const response = await requestApi<{ attestations: PartnerAttestationSummary[] }>("/partner/attestations", {
    signal,
  })
  return response.attestations ?? []
}

export async function createPartnerAttestationDraft(
  input: PartnerAttestationDraftInput,
): Promise<PartnerAttestationSummary> {
  const payload = sanitizeDraftInput(input)
  return requestApi<PartnerAttestationSummary>("/partner/attestations", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function publishPartnerAttestation(id: string): Promise<PartnerAttestationSummary> {
  return requestApi<PartnerAttestationSummary>(`/partner/attestations/${encodeURIComponent(id)}/publish`, {
    method: "POST",
  })
}

export async function refreshPartnerAttestation(id: string): Promise<PartnerAttestationSummary> {
  return requestApi<PartnerAttestationSummary>(`/partner/attestations/${encodeURIComponent(id)}/refresh`, {
    method: "POST",
  })
}

export async function revokePartnerAttestation(id: string): Promise<PartnerAttestationSummary> {
  return requestApi<PartnerAttestationSummary>(`/partner/attestations/${encodeURIComponent(id)}/revoke`, {
    method: "POST",
  })
}

export async function updatePartnerAttestationBadgeStyle(
  id: string,
  input: PartnerAttestationBadgeStyleInput,
): Promise<PartnerAttestationSummary> {
  return requestApi<PartnerAttestationSummary>(
    `/partner/attestations/${encodeURIComponent(id)}/badge-style`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )
}

export async function updatePartnerAttestationBadgeConfig(
  id: string,
  input: PartnerAttestationBadgeConfigInput,
): Promise<PartnerAttestationSummary> {
  return requestApi<PartnerAttestationSummary>(
    `/partner/attestations/${encodeURIComponent(id)}/badge-config`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )
}

export async function updatePartnerAttestationMetadata(
  id: string,
  input: PartnerAttestationMetadataInput,
): Promise<PartnerAttestationSummary> {
  const payload = sanitizeAttestationMetadataInput(input)
  return requestApi<PartnerAttestationSummary>(
    `/partner/attestations/${encodeURIComponent(id)}/metadata`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  )
}

export async function deletePartnerAttestationDraft(id: string): Promise<void> {
  await requestApi(`/partner/attestations/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export async function updatePartnerBadgePreferences(
  input: PartnerBadgePreferencesInput,
): Promise<PartnerProfile> {
  const response = await requestApi<{ partner: PartnerProfile }>("/partner/badge-preferences", {
    method: "POST",
    body: JSON.stringify(input),
  })
  return response.partner
}

function toBase64Url(value: string): string {
  const encoded = typeof window !== "undefined" && typeof window.btoa === "function"
    ? window.btoa(value)
    : btoa(value)
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

export async function uploadSubmission(
  file: File,
  metadata?: PartnerSubmissionMetadata | null,
  signal?: AbortSignal,
): Promise<string> {
  if (file.size <= FILES_SIZE_LIMIT_BYTES) {
    const formData = new FormData()
    formData.set("file", file, file.name)
    if (metadata && Object.keys(metadata).length > 0) {
      formData.set("metadata", JSON.stringify(metadata))
    }

    const response = await requestUploadApi<PartnerUploadResponse>("/files", {
      method: "POST",
      body: formData,
      signal,
    })

    return response.data.id
  }

  const query = new URLSearchParams({ filename: file.name })
  if (file.type) {
    query.set("contentType", file.type)
  }
  if (metadata && Object.keys(metadata).length > 0) {
    query.set("metadata", toBase64Url(JSON.stringify(metadata)))
  }

  const uploadUrlResponse = await requestUploadApi<PartnerUploadUrlResponse>(
    `/files/upload_url?${query.toString()}`,
    { method: "GET", signal },
  )

  const uploadHeaders = file.type ? { "Content-Type": file.type } : undefined
  let putResponse: Response
  try {
    putResponse = await fetch(uploadUrlResponse.data.upload_url, {
      method: "PUT",
      headers: uploadHeaders,
      body: file,
      signal,
    })
  } catch (error) {
    if (
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw error
    }

    const origin =
      typeof window !== "undefined" ? window.location.origin : "this dashboard origin"
    console.error(
      `Large file upload could not reach the presigned upload target from ${origin}. Check storage upload configuration for this origin.`,
    )
    throw new Error(
      "Large file upload could not be completed from this browser. Try again, or use a smaller file if the problem continues.",
    )
  }

  if (!putResponse.ok) {
    throw new Error(`Large file upload failed (${putResponse.status})`)
  }

  return uploadUrlResponse.data.submission_id
}

export async function getPartnerReport(
  submissionId: string,
  signal?: AbortSignal,
): Promise<PartnerReportResponse> {
  return requestUploadApi<PartnerReportResponse>(`/reports/${encodeURIComponent(submissionId)}`, {
    method: "GET",
    signal,
  })
}
