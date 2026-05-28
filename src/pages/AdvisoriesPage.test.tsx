import { describe, expect, it } from "vitest"

import { shouldScrollAdvisoryDetailToTop } from "./advisory-scroll"

describe("AdvisoriesPage", () => {
  it("scrolls advisory detail routes to the top", () => {
    expect(shouldScrollAdvisoryDetailToTop("2026-03-malware-vortex-backuprtilizer", "")).toBe(true)
  })

  it("does not override advisory list or explicit hash links", () => {
    expect(shouldScrollAdvisoryDetailToTop(undefined, "")).toBe(false)
    expect(shouldScrollAdvisoryDetailToTop("2026-03-malware-vortex-backuprtilizer", "#detection")).toBe(false)
  })
})
