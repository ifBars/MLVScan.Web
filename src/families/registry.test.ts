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
      "CustomTV_IL2CPP.dll",
      "NoMoreTrash.dll",
      "RealRadio.dll",
      "S1API.Il2Cpp.MelonLoader.dll",
    ])
    expect(family?.advisorySlugs).toEqual([
      "2025-12-malware-customtv-il2cpp",
      "2025-12-malware-nomoretrash",
      "2025-12-malware-realandwaitingtimeonfire",
    ])
    expect(family?.behaviorTags).toContain("shellexecute")
    expect(family?.behaviorTags).toContain("temp-cmd")
  })

  it("keeps the registry aligned with current Core threat family ids", () => {
    expect(allThreatFamilies.map((family) => family.id)).toEqual([
      "family-resource-shell32-tempcmd-v2",
      "family-powershell-iwr-dlbat-v1",
      "family-webdownload-stage-exec-v3",
      "family-embedded-resource-script-stager-v1",
      "family-remote-script-pipe-shell-v1",
      "family-encoded-powershell-tempcmd-stager-v1",
      "family-hex-remote-config-tempcmd-stager-v1",
      "family-dynamic-assembly-reflection-loader-v1",
      "family-obfuscated-metadata-loader-v2",
    ])
  })

  it("exposes pages for the new quarantine behavior families", () => {
    expect(getThreatFamilyById("family-encoded-powershell-tempcmd-stager-v1")?.slug).toBe(
      "encoded-powershell-tempcmd-stager-v1",
    )
    expect(getThreatFamilyById("family-dynamic-assembly-reflection-loader-v1")?.sampleNames).toContain(
      "iiModdedV5.dll",
    )
    expect(getThreatFamilyById("family-remote-script-pipe-shell-v1")?.sampleNames).toEqual([
      "TwelvePlayerExpansion.dll",
    ])
    expect(getThreatFamilyById("family-embedded-resource-script-stager-v1")?.sampleNames).toEqual([
      "noclip.dll",
    ])
    expect(getThreatFamilyById("family-hex-remote-config-tempcmd-stager-v1")?.sampleNames).toEqual([
      "CopyPasteFilterHotkeys_IL2Cpp.dll",
      "MegaMenu.dll",
    ])
    expect(getThreatFamilyById("family-obfuscated-metadata-loader-v2")?.sampleNames).toContain(
      "UnlimitedBatteries.dll",
    )
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
