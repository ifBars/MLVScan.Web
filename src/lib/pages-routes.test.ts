import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

describe("Cloudflare Pages function routes", () => {
  it("lets static redirects handle public attestation pages and badges", () => {
    const routesPath = resolve(process.cwd(), "public", "_routes.json")
    const routes = JSON.parse(readFileSync(routesPath, "utf8")) as {
      version?: number
      include?: string[]
      exclude?: string[]
    }

    expect(routes.version).toBe(1)
    expect(routes.include).toContain("/*")
    expect(routes.exclude).toContain("/attestations/*")
    expect(routes.exclude).toContain("/docs/reference/*")
    expect(routes.exclude).toContain("/assets/*")
    expect(routes.exclude).toContain("/icon.png")
    expect(routes.exclude).toContain("/sitemap.xml")
  })
})
