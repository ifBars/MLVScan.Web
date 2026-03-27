import type {
  PartnerAttestationBadgeStyleInput,
  PartnerAttestationDraftInput,
  PartnerAttestationSummary,
  PartnerAuthProviders,
  PartnerCreateKeyInput,
  PartnerCreateKeyResponse,
  PartnerReportResponse,
  PartnerRotateKeyResponse,
  PartnerSessionResponse,
  PartnerUploadResponse,
  PartnerUploadUrlResponse,
  PartnerApiKey,
} from "@/types/partner-dashboard"

// Keep direct dashboard uploads under the buffered multipart Worker path.
// Larger browser uploads should go straight to R2 via a presigned URL.
const FILES_SIZE_LIMIT_BYTES = 32 * 1024 * 1024

interface ApiErrorBody {
  error?: string
  message?: string
  csrfToken?: string
}

let csrfToken: string | null = null

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "")
}

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_API_BASE_URL?.trim()
  if (configured) {
    return trimTrailingSlashes(configured)
  }

  if (typeof window !== "undefined") {
    return trimTrailingSlashes(window.location.origin)
  }

  return ""
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
  const headers = new Headers(init.headers)
  headers.set("Accept", "application/json")

  const response = await fetch(buildApiUrl(path), {
    ...init,
    credentials: "same-origin",
    headers,
  })
  const responseBody = await readJson(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(responseBody, response))
  }

  return responseBody as T
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

export async function requestPartnerUpgrade(): Promise<{ success: boolean; message: string }> {
  return requestApi<{ success: boolean; message: string }>("/partner/auth/request-upgrade", {
    method: "POST",
    body: JSON.stringify({ requestedTier: "partner" }),
  })
}

export async function listPartnerApiKeys(signal?: AbortSignal): Promise<PartnerApiKey[]> {
  const response = await requestApi<{ keys: PartnerApiKey[] }>("/partner/api-keys", { signal })
  return response.keys ?? []
}

export async function createPartnerApiKey(
  input: PartnerCreateKeyInput,
): Promise<PartnerCreateKeyResponse> {
  return requestApi<PartnerCreateKeyResponse>("/partner/api-keys", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function rotatePartnerApiKey(id: string): Promise<PartnerRotateKeyResponse> {
  return requestApi<PartnerRotateKeyResponse>(`/partner/api-keys/${encodeURIComponent(id)}/rotate`, {
    method: "POST",
  })
}

export async function revokePartnerApiKey(id: string): Promise<void> {
  await requestApi<{ success: boolean }>(`/partner/api-keys/${encodeURIComponent(id)}/revoke`, {
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
  return requestApi<PartnerAttestationSummary>("/partner/attestations", {
    method: "POST",
    body: JSON.stringify(input),
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

export async function uploadSubmission(file: File, signal?: AbortSignal): Promise<string> {
  if (file.size <= FILES_SIZE_LIMIT_BYTES) {
    const formData = new FormData()
    formData.set("file", file, file.name)

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
  } catch {
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
