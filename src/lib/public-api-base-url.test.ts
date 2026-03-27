import { describe, expect, it } from "vitest"

import { resolvePublicApiBaseUrl } from "@/lib/public-api-base-url"

describe("public-api-base-url", () => {
  it("prefers the configured API base URL", () => {
    expect(resolvePublicApiBaseUrl({
      configuredBaseUrl: "https://custom.example.com///",
      origin: "https://mlvscan.com",
      hostname: "mlvscan.com",
    })).toBe("https://custom.example.com")
  })

  it("keeps same-origin API calls for localhost development", () => {
    expect(resolvePublicApiBaseUrl({
      origin: "http://localhost:5173",
      hostname: "localhost",
    })).toBe("http://localhost:5173")
  })

  it("uses the hosted API origin for the production web app", () => {
    expect(resolvePublicApiBaseUrl({
      origin: "https://mlvscan.com",
      hostname: "mlvscan.com",
    })).toBe("https://api.mlvscan.com")
  })

  it("uses the hosted API origin for Pages previews", () => {
    expect(resolvePublicApiBaseUrl({
      origin: "https://preview.mlvscan-web.pages.dev",
      hostname: "preview.mlvscan-web.pages.dev",
    })).toBe("https://api.mlvscan.com")
  })

  it("keeps same-origin requests when already on the API host", () => {
    expect(resolvePublicApiBaseUrl({
      origin: "https://api.mlvscan.com",
      hostname: "api.mlvscan.com",
    })).toBe("https://api.mlvscan.com")
  })
})
