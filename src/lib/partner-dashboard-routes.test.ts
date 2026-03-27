import { describe, expect, it } from "vitest"

import {
  getPartnerDashboardPath,
  getPartnerDashboardView,
} from "@/lib/partner-dashboard-routes"

describe("partner-dashboard-routes", () => {
  it("returns canonical paths for dashboard workspaces", () => {
    expect(getPartnerDashboardPath("home")).toBe("/dashboard")
    expect(getPartnerDashboardPath("publish")).toBe("/dashboard/submit")
    expect(getPartnerDashboardPath("attestations")).toBe("/dashboard/attestations")
    expect(getPartnerDashboardPath("access")).toBe("/dashboard/access")
  })

  it("maps canonical paths back to dashboard workspaces", () => {
    expect(getPartnerDashboardView("/dashboard")).toBe("home")
    expect(getPartnerDashboardView("/dashboard/submit")).toBe("publish")
    expect(getPartnerDashboardView("/dashboard/attestations")).toBe("attestations")
    expect(getPartnerDashboardView("/dashboard/access")).toBe("access")
  })

  it("accepts trailing slashes on dashboard paths", () => {
    expect(getPartnerDashboardView("/dashboard/")).toBe("home")
    expect(getPartnerDashboardView("/dashboard/submit/")).toBe("publish")
    expect(getPartnerDashboardView("/dashboard/attestations/")).toBe("attestations")
    expect(getPartnerDashboardView("/dashboard/access/")).toBe("access")
  })

  it("returns null for unknown paths", () => {
    expect(getPartnerDashboardView("/")).toBeNull()
    expect(getPartnerDashboardView("/dashboard/unknown")).toBeNull()
    expect(getPartnerDashboardView("/scan")).toBeNull()
  })
})
