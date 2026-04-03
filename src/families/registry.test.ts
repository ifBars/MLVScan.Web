import { describe, expect, it } from "vitest"
import { allAdvisories } from "@/advisories/registry"
import {
  allThreatFamilies,
  getThreatFamilyById,
  getThreatFamilyBySlug,
  threatFamiliesById,
  threatFamiliesBySlug,
} from "./registry"

describe("threat family registry", () => {
  it("keeps the embedded resource temp cmd family aligned with the Core v2 family id", () => {
    const family = getThreatFamilyById("family-resource-shell32-tempcmd-v2")

    expect(family).toBeDefined()
    expect(family?.slug).toBe("resource-shell32-tempcmd-v2")
    expect(family?.contentPath).toBe("resource-shell32-tempcmd-v2.mdx")
    expect(family?.sampleNames).toEqual([
      "CustomTV_IL2CPP.dll.di",
      "NoMoreTrash.dll.di",
      "RealRadio.dll.di",
      "S1API.Il2Cpp.MelonLoader.dll.di",
    ])
    expect(family?.advisorySlugs).toEqual([
      "2025-12-malware-customtv-il2cpp",
      "2025-12-malware-nomoretrash",
      "2025-12-malware-realandwaitingtimeonfire",
    ])
    expect(family?.behaviorTags).toContain("shellexecute")
    expect(family?.behaviorTags).toContain("temp-cmd")
  })

  it("indexes every family by both id and slug", () => {
    for (const family of allThreatFamilies) {
      expect(threatFamiliesById[family.id]).toBe(family)
      expect(threatFamiliesBySlug[family.slug]).toBe(family)
      expect(getThreatFamilyBySlug(family.slug)).toBe(family)
    }
  })

  it("only assigns advisories to known family ids", () => {
    const advisoryFamilyIds = allAdvisories
      .map((advisory) => advisory.familyId)
      .filter((familyId): familyId is string => Boolean(familyId))

    expect(advisoryFamilyIds.length).toBeGreaterThan(0)

    for (const familyId of advisoryFamilyIds) {
      expect(getThreatFamilyById(familyId)).toBeDefined()
    }
  })
})
