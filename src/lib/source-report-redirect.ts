import { resolvePublicApiBaseUrl } from "@/lib/public-api-base-url"

export type SourceReportRedirectTarget =
  | {
    provider: "nexusmods"
    game: string
    modId: string
  }
  | {
    provider: "thunderstore"
    game: string
    packageFullName: string
  }

export interface SourceReportRedirectResult {
  submissionId: string
  reportPath: string
}

interface SourceArtifactLookupItem {
  latestSubmissionId: string | null
}

export class SourceReportNotFoundError extends Error {
  constructor() {
    super("No public source-linked report found")
    this.name = "SourceReportNotFoundError"
  }
}

export function parseSourceReportRedirectPath(pathname: string): SourceReportRedirectTarget | null {
  const segments = pathname.split("/").filter(Boolean).map((segment) => {
    try {
      return decodeURIComponent(segment)
    } catch {
      return segment
    }
  })

  if (segments.length >= 3 && segments[1] === "mods" && /^\d+$/.test(segments[2])) {
    return {
      provider: "nexusmods",
      game: segments[0],
      modId: segments[2],
    }
  }

  if (segments.length >= 5 && segments[0] === "c" && segments[2] === "p") {
    return {
      provider: "thunderstore",
      game: segments[1],
      packageFullName: `${segments[3]}-${segments[4]}`,
    }
  }

  return null
}

export function resolveSourceReportApiBaseUrl(): string {
  return resolvePublicApiBaseUrl({
    configuredBaseUrl: import.meta.env.VITE_PUBLIC_API_BASE_URL,
  })
}

export async function fetchLatestSourceReportRedirect(
  target: SourceReportRedirectTarget,
  signal?: AbortSignal,
): Promise<SourceReportRedirectResult> {
  const params = new URLSearchParams()
  params.set("provider", target.provider)
  params.set("game", target.game)
  params.set("limit", "1")

  if (target.provider === "nexusmods") {
    params.set("modId", target.modId)
  } else {
    params.set("packageFullName", target.packageFullName)
  }

  const response = await fetch(`${resolveSourceReportApiBaseUrl()}/sources?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to resolve source report (${response.status})`)
  }

  const body: unknown = await response.json()
  if (!isSourceLookupResponse(body)) {
    throw new Error("Source report lookup response was missing required fields")
  }

  const submissionId = body.data[0]?.latestSubmissionId
  if (!submissionId) {
    throw new SourceReportNotFoundError()
  }

  return {
    submissionId,
    reportPath: `/reports/${encodeURIComponent(submissionId)}`,
  }
}

function isSourceLookupResponse(value: unknown): value is { data: SourceArtifactLookupItem[] } {
  return isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every((item) => (
      isRecord(item) &&
      (item.latestSubmissionId === null || typeof item.latestSubmissionId === "string")
    ))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
