import { describe, expect, it } from "vitest"
import type { Finding, ScanResult, ThreatFamily } from "@/types/mlvscan"
import {
  findingMatchesSearch,
  getFamilyFindingIds,
  getTargetDisplay,
  getVerdictFindingIds,
  groupFindings,
} from "@/lib/finding-groups"

const processFinding = (id: string, overrides: Partial<Finding> = {}): Finding => ({
  id,
  ruleId: "ProcessStartRule",
  description: "Detected Process.Start call which could execute arbitrary programs.",
  severity: "Medium",
  location: `Mod.Menu.Buttons.Open${id}:5`,
  visibility: "Default",
  ...overrides,
})

const family = (overrides: Partial<ThreatFamily> = {}): ThreatFamily => ({
  familyId: "family-a",
  variantId: "variant-a",
  displayName: "Family A",
  summary: "Summary",
  matchKind: "BehaviorVariant",
  confidence: 0.96,
  exactHashMatch: false,
  matchedRules: ["ProcessStartRule"],
  advisorySlugs: [],
  evidence: [],
  relatedFindingIds: [],
  ...overrides,
})

const result = (overrides: Partial<ScanResult> = {}): ScanResult => ({
  schemaVersion: "1.4.0",
  metadata: {
    coreVersion: "1.9.2",
    platformVersion: "1.9.2",
    timestamp: new Date().toISOString(),
    scanMode: "detailed",
    platform: "wasm",
    scannerVersion: "1.9.2",
  },
  input: { fileName: "test.dll", sizeBytes: 128, sha256Hash: "abc" },
  summary: { totalFindings: 0, countBySeverity: {}, triggeredRules: [] },
  analysisCompleteness: { status: "Complete", isComplete: true, reviewRecommended: false, reasons: [] },
  findings: [],
  ...overrides,
})

describe("groupFindings", () => {
  it("collapses repeated launches by target kind and counts repeated targets", () => {
    const findings = [
      ...Array.from({ length: 15 }, (_, index) =>
        processFinding(`gh-${index}`, { attributes: { target: "github.com", targetKind: "Url" } })
      ),
      processFinding("discord", { attributes: { target: "https://discord.gg/abc", targetKind: "Url" } }),
      processFinding("bat", { attributes: { target: "UpdateScript.bat", targetKind: "Script" } }),
    ]

    const groups = groupFindings(findings, new Set())

    expect(groups).toHaveLength(2)
    const links = groups.find((group) => group.title === "Opens web links")
    expect(links?.findings).toHaveLength(16)
    expect(links?.summary).toBe("github.com ×15, https://discord.gg/abc")
    expect(groups.find((group) => group.title === "Runs a script or shell")?.summary).toBe("UpdateScript.bat")
  })

  it("keeps verdict findings in their own group ahead of higher-volume context", () => {
    const hidden = processFinding("svchost", {
      severity: "Critical",
      attributes: {
        target: "<ambiguous field> [Possible values: <folder 40>/Downloads/svchost.exe | <null>]",
        targetKind: "Executable",
        targetCandidates: ["<folder 40>/Downloads/svchost.exe"],
        indicators: ["CreateNoWindow=true", "WindowStyle=Hidden"],
      },
    })
    const links = Array.from({ length: 5 }, (_, index) =>
      processFinding(`gh-${index}`, { attributes: { target: "github.com", targetKind: "Url" } })
    )

    const groups = groupFindings([...links, hidden], new Set(["svchost"]))

    expect(groups[0]).toMatchObject({ title: "Launches a hidden program", usedInVerdict: true, severity: "Critical" })
    expect(groups[0].summary).toBe("…/Downloads/svchost.exe")
    expect(groups[1]).toMatchObject({ title: "Opens web links", usedInVerdict: false })
  })

  it("falls back to rule titles for findings without attributes", () => {
    const groups = groupFindings(
      [{ id: "load", ruleId: "AssemblyDynamicLoadRule", description: "Detected dynamic assembly loading.", severity: "High", location: "A.B.Plugin.GetAssembly:38" }],
      new Set()
    )

    expect(groups[0]).toMatchObject({ title: "Loads assemblies at runtime", summary: "Plugin.GetAssembly:38" })
  })
})

describe("family finding links", () => {
  it("uses relatedFindingIds from the family when present", () => {
    expect(getFamilyFindingIds(family({ relatedFindingIds: ["a"] }), [processFinding("a"), processFinding("b")])).toEqual(["a"])
  })

  it("falls back to evidence rule and location for older payloads", () => {
    const findings = [processFinding("a"), processFinding("b")]
    const legacy = family({
      relatedFindingIds: undefined as unknown as string[],
      evidence: [{ kind: "rule", value: "ProcessStartRule", ruleId: "ProcessStartRule", location: findings[1].location }],
    })

    expect(getFamilyFindingIds(legacy, findings)).toEqual(["b"])
  })

  it("uses disposition findings as the verdict set for suspicious results without families", () => {
    const ids = getVerdictFindingIds(
      result({
        findings: [processFinding("a")],
        disposition: {
          classification: "Suspicious",
          headline: "Suspicious",
          summary: "Suspicious",
          blockingRecommended: true,
          relatedFindingIds: ["a"],
        },
      })
    )

    expect([...ids]).toEqual(["a"])
  })

  it("does not mark clean results as having verdict findings", () => {
    const ids = getVerdictFindingIds(
      result({
        findings: [processFinding("a")],
        disposition: {
          classification: "Clean",
          headline: "Clean",
          summary: "Clean",
          blockingRecommended: false,
          relatedFindingIds: ["a"],
        },
      })
    )

    expect(ids.size).toBe(0)
  })
})

describe("target display and search", () => {
  it("hides fully unresolved targets and shortens placeholders", () => {
    expect(getTargetDisplay({ target: "<unknown/non-literal>", targetKind: "Unresolved" })).toBeNull()
    expect(getTargetDisplay({ target: "<dynamic via Ldelem_Ref>/iisStupidMenu/Plugins", targetKind: "Path" })).toBe(
      "…/iisStupidMenu/Plugins"
    )
  })

  it("matches search against target candidates and locations", () => {
    const finding = processFinding("x", {
      attributes: { target: "<ambiguous field>", targetKind: "Executable", targetCandidates: ["C:/Temp/svchost.exe"] },
    })

    expect(findingMatchesSearch(finding, "svchost")).toBe(true)
    expect(findingMatchesSearch(finding, "OpenX")).toBe(true)
    expect(findingMatchesSearch(finding, "github")).toBe(false)
  })
})
