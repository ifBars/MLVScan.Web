import { describe, expect, it } from "vitest"
import type { ThreatFamily, ThreatFamilyEvidence } from "@/types/mlvscan"
import {
  getThreatFamilyEvidencePreview,
  sortThreatFamilyMatches,
} from "@/components/results/threat-family-match-utils"

const createEvidence = (overrides: Partial<ThreatFamilyEvidence> = {}): ThreatFamilyEvidence => ({
  kind: "other",
  value: "Unspecified evidence",
  ruleId: null,
  location: null,
  callChainId: null,
  dataFlowChainId: null,
  pattern: null,
  methodLocation: null,
  confidence: null,
  ...overrides,
})

const createMatch = (overrides: Partial<ThreatFamily> = {}): ThreatFamily => ({
  familyId: "family-a",
  variantId: "variant-a",
  displayName: "Family A",
  summary: "Summary",
  matchKind: "BehaviorVariant",
  confidence: 0.5,
  exactHashMatch: false,
  matchedRules: [],
  advisorySlugs: [],
  evidence: [createEvidence()],
  ...overrides,
})

describe("threat-family-match-utils", () => {
  it("sorts the disposition-linked family first", () => {
    const matches = [
      createMatch({ familyId: "family-high", confidence: 0.99, displayName: "High confidence" }),
      createMatch({ familyId: "family-primary", confidence: 0.4, displayName: "Primary family" }),
      createMatch({ familyId: "family-mid", confidence: 0.75, displayName: "Mid confidence" }),
    ]

    expect(sortThreatFamilyMatches(matches, "family-primary").map((match) => match.familyId)).toEqual([
      "family-primary",
      "family-high",
      "family-mid",
    ])
  })

  it("sorts by confidence when no primary family id exists", () => {
    const matches = [
      createMatch({ familyId: "family-low", confidence: 0.42 }),
      createMatch({ familyId: "family-high", confidence: 0.91 }),
      createMatch({ familyId: "family-mid", confidence: 0.65 }),
    ]

    expect(sortThreatFamilyMatches(matches).map((match) => match.familyId)).toEqual([
      "family-high",
      "family-mid",
      "family-low",
    ])
  })

  it("breaks equal-confidence ties in favor of exact hash matches", () => {
    const matches = [
      createMatch({
        familyId: "behavior-variant",
        matchKind: "BehaviorVariant",
        exactHashMatch: false,
        confidence: 0.87,
      }),
      createMatch({
        familyId: "exact-hash",
        matchKind: "ExactSampleHash",
        exactHashMatch: true,
        confidence: 0.87,
      }),
    ]

    expect(sortThreatFamilyMatches(matches)[0]?.familyId).toBe("exact-hash")
  })

  it("prefers the highest-signal evidence kinds for the collapsed preview", () => {
    const evidence = [
      createEvidence({ kind: "rule", value: "ProcessStartRule" }),
      createEvidence({ kind: "custom", value: "Ancillary context" }),
      createEvidence({ kind: "source", value: "WebClient download" }),
      createEvidence({ kind: "pattern", value: "DownloadAndExecute", pattern: "DownloadAndExecute" }),
      createEvidence({ kind: "execution", value: "Hidden cmd.exe launch" }),
    ]

    expect(getThreatFamilyEvidencePreview(evidence, 2).map((item) => item.kind)).toEqual([
      "pattern",
      "source",
    ])
  })

  it("falls back to the original order for unranked evidence kinds and respects the preview limit", () => {
    const evidence = [
      createEvidence({ kind: "custom", value: "First fallback item" }),
      createEvidence({ kind: "metadata", value: "Second fallback item" }),
      createEvidence({ kind: "custom", value: "Third fallback item" }),
    ]

    expect(getThreatFamilyEvidencePreview(evidence, 2).map((item) => item.value)).toEqual([
      "First fallback item",
      "Second fallback item",
    ])
    expect(getThreatFamilyEvidencePreview([], 2)).toEqual([])
  })
})
