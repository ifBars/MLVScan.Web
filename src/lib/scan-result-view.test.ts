import { describe, expect, it } from "vitest"
import type { Finding, ScanResult } from "@/types/mlvscan"
import {
  getActionItems,
  getAdvancedFindings,
  getDefaultFindings,
  getDisplayedFindings,
  getResultClassification,
  getResultPresentationClassification,
} from "@/lib/scan-result-view"

const createResult = (overrides: Partial<ScanResult> = {}): ScanResult => ({
  schemaVersion: "1.2.0",
  metadata: {
    coreVersion: "1.0.0",
    platformVersion: "1.0.0",
    timestamp: new Date().toISOString(),
    scanMode: "detailed",
    platform: "wasm",
    scannerVersion: "1.0.0",
  },
  input: {
    fileName: "test.dll",
    sizeBytes: 128,
    sha256Hash: "abc",
  },
  summary: {
    totalFindings: 1,
    countBySeverity: { Critical: 1 },
    triggeredRules: ["TestRule"],
  },
  findings: [],
  ...overrides,
})

const createFinding = (overrides: Partial<Finding> = {}): Finding => ({
  id: "finding-1",
  ruleId: "TestRule",
  description: "Test finding",
  severity: "Critical",
  location: "Test.Mod.Init",
  codeSnippet: null,
  riskScore: null,
  callChainId: null,
  dataFlowChainId: null,
  developerGuidance: null,
  callChain: null,
  dataFlowChain: null,
  visibility: "Default",
  ...overrides,
})

describe("scan-result-view", () => {
  it("prefers disposition over severity-based fallback", () => {
    const result = createResult({
      disposition: {
        classification: "Clean",
        headline: "No known threats detected",
        summary: "Advanced diagnostics were retained but did not affect the verdict.",
        blockingRecommended: false,
        primaryThreatFamilyId: null,
        relatedFindingIds: [],
      },
      findings: [createFinding({ visibility: "Advanced" })],
    })

    expect(getResultClassification(result)).toBe("Clean")
    expect(getActionItems(result)[0]).toBe("No action is recommended from this scan result alone.")
  })

  it("hides advanced findings by default when visibility metadata is present", () => {
    const result = createResult({
      findings: [
        createFinding({ id: "finding-default", visibility: "Default" }),
        createFinding({ id: "finding-advanced", visibility: "Advanced", severity: "Low" }),
      ],
    })

    expect(getDefaultFindings(result).map((finding) => finding.id)).toEqual(["finding-default"])
    expect(getAdvancedFindings(result).map((finding) => finding.id)).toEqual(["finding-advanced"])
    expect(getDisplayedFindings(result, false).map((finding) => finding.id)).toEqual(["finding-default"])
    expect(getDisplayedFindings(result, true).map((finding) => finding.id)).toEqual([
      "finding-default",
      "finding-advanced",
    ])
  })

  it("falls back to suspicious when old results have findings but no disposition", () => {
    const result = createResult({
      disposition: undefined,
      findings: [createFinding({ visibility: undefined })],
      threatFamilies: null,
    })

    expect(getResultClassification(result)).toBe("Suspicious")
  })

  it("surfaces incomplete scan warnings as manual review instead of clean", () => {
    const result = createResult({
      disposition: {
        classification: "Clean",
        headline: "No known threats detected",
        summary: "No retained malicious verdict was produced.",
        blockingRecommended: false,
        primaryThreatFamilyId: null,
        relatedFindingIds: [],
      },
      findings: [
        createFinding({
          id: "incomplete-scan-warning",
          severity: "Low",
          visibility: "Advanced",
          description:
            "Warning: Some parts of the assembly could not be scanned. Please ensure this is a valid Unity mod. This doesn't necessarily mean the mod is malicious.",
        }),
      ],
    })

    expect(getResultClassification(result)).toBe("Clean")
    expect(getResultPresentationClassification(result)).toBe("ManualReviewRequired")
    expect(getActionItems(result)[0]).toBe(
      "Do not treat this file as clean until the incomplete scan warning is reviewed."
    )
  })
})
