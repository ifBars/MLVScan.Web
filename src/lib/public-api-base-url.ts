function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "")
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname.endsWith(".localhost")
}

function shouldUseHostedApiOrigin(hostname: string): boolean {
  return hostname === "mlvscan.com" || hostname === "www.mlvscan.com" || hostname.endsWith(".pages.dev")
}

export interface PublicApiBaseUrlOptions {
  configuredBaseUrl?: string | null
  origin?: string | null
  hostname?: string | null
}

export function resolvePublicApiBaseUrl(options: PublicApiBaseUrlOptions = {}): string {
  const configured = options.configuredBaseUrl?.trim()
  if (configured) {
    return trimTrailingSlashes(configured)
  }

  const runtimeOrigin = options.origin ?? (typeof window !== "undefined" ? window.location.origin : null)
  const runtimeHostname = options.hostname ?? (typeof window !== "undefined" ? window.location.hostname : null)

  if (!runtimeOrigin || !runtimeHostname) {
    return ""
  }

  if (isLocalhost(runtimeHostname) || runtimeHostname === "api.mlvscan.com") {
    return trimTrailingSlashes(runtimeOrigin)
  }

  if (shouldUseHostedApiOrigin(runtimeHostname)) {
    return "https://api.mlvscan.com"
  }

  return trimTrailingSlashes(runtimeOrigin)
}
