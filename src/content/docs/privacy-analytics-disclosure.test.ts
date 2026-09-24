import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("privacy analytics disclosure", () => {
  const privacy = readFileSync("src/content/docs/privacy.mdx", "utf8")

  it("discloses trusted first-party bot attribution without expanding collected identifiers", () => {
    expect(privacy).toMatch(/Last Updated:<\/strong> [A-Z][a-z]+ \d{1,2}, \d{4}/)
    expect(privacy).toContain("<code>mlvscan_bot</code>")
    expect(privacy).toContain("trusted server-side key ownership metadata")
    expect(privacy).toContain("rather than a caller-provided tracking header")
    expect(privacy).toContain("do not include raw account identifiers, API keys, IP addresses")
  })
})
