import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

function redirectLines(): string[] {
  const redirectsPath = resolve(process.cwd(), "public", "_redirects")
  return readFileSync(redirectsPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
}

function isRedirectRule(line: string, source: string, destination: string, status: string): boolean {
  const [lineSource, lineDestination, lineStatus] = line.split(/\s+/)
  return lineSource === source && lineDestination === destination && lineStatus === status
}

describe("Cloudflare Pages redirects", () => {
  it("serves public attestation pages through the SPA while preserving badge SVG redirects", () => {
    const lines = redirectLines()
    const attestationPageRuleIndex = lines.findIndex((line) =>
      isRedirectRule(line, "/attestations/:shareId", "/", "200")
    )
    const coreApiRuleIndex = lines.findIndex((line) =>
      isRedirectRule(line, "/docs/reference/core/api/", "/docs/reference/core/api/MLVScan", "302")
    )
    const referenceSelfRewriteIndex = lines.findIndex((line) =>
      isRedirectRule(line, "/docs/reference/*", "/docs/reference/:splat", "200")
    )
    const assetsRuleIndex = lines.findIndex((line) =>
      isRedirectRule(line, "/assets/*", "/assets/:splat", "200")
    )
    const iconRuleIndex = lines.findIndex((line) =>
      isRedirectRule(line, "/icon.png", "/icon.png", "200")
    )
    const badgeRuleIndex = lines.findIndex((line) =>
      isRedirectRule(
        line,
        "/attestations/:shareId/badge.svg",
        "https://api.mlvscan.com/public/attestations/:shareId/badge.svg",
        "302",
      )
    )
    const catchAllIndex = lines.findIndex((line) => isRedirectRule(line, "/*", "/", "200"))

    expect(attestationPageRuleIndex).toBeGreaterThanOrEqual(0)
    expect(coreApiRuleIndex).toBeGreaterThanOrEqual(0)
    expect(referenceSelfRewriteIndex).toBe(-1)
    expect(assetsRuleIndex).toBeGreaterThanOrEqual(0)
    expect(iconRuleIndex).toBeGreaterThanOrEqual(0)
    expect(badgeRuleIndex).toBeGreaterThanOrEqual(0)
    expect(catchAllIndex).toBe(-1)
    expect(badgeRuleIndex).toBeLessThan(attestationPageRuleIndex)
  })
})
