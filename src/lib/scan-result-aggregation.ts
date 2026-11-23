import type { ScanResult, ThreatDispositionClassification } from "@/types/mlvscan"

import { getResultPresentationClassification } from "./scan-result-view"

const getPackageClassification = (results: ScanResult[]): ThreatDispositionClassification => {
  const outcomes = results.map(getResultPresentationClassification)
  for (const outcome of ["KnownThreat", "Suspicious", "ManualReviewRequired", "Clean"] as const) {
    if (outcomes.includes(outcome)) return outcome
  }
  return "NotApplicable"
}

export function combineScanResults(packageFileName: string, results: ScanResult[]): ScanResult {
  if (results.length === 1) {
    return results[0]
  }

  const applicable = results.filter(result => result.analysisCompleteness?.status !== "NotApplicable")
  const excluded = results.filter(result => result.analysisCompleteness?.status === "NotApplicable")
  const first = applicable[0] ?? results[0]
  const incomplete = applicable.filter(result => result.analysisCompleteness?.isComplete === false)
  const coverage = excluded.map(result => result.input.fileName).join(", ")
  const findings = results.flatMap((result) => result.findings ?? [])
  const blockingRecommended = results.some((result) => result.disposition?.blockingRecommended === true)
  const classification = getPackageClassification(results)
  const sizeBytes = results.reduce((total, result) => total + (result.input?.sizeBytes ?? 0), 0)

  const countBySeverity = results.reduce<Record<string, number>>((counts, result) => {
    for (const [severity, count] of Object.entries(result.summary?.countBySeverity ?? {})) {
      counts[severity] = (counts[severity] ?? 0) + count
    }
    return counts
  }, {})

  return {
    ...first,
    input: {
      ...first.input,
      fileName: packageFileName,
      sizeBytes,
    },
    summary: {
      ...first.summary,
      totalFindings: findings.length,
      triggeredRules: [...new Set(results.flatMap((result) => result.summary?.triggeredRules ?? []))],
      countBySeverity,
    },
    analysisCompleteness: {
      status: applicable.length === 0 ? "NotApplicable" : incomplete.length === 0 ? "Complete" : incomplete.length === applicable.length ? "Incomplete" : "Partial",
      isComplete: applicable.length > 0 && incomplete.length === 0,
      reviewRecommended: incomplete.some(result => result.analysisCompleteness.reviewRecommended),
      reasons: results.flatMap(result => result.analysisCompleteness?.reasons ?? []),
    },
    findings,
    threatFamilies: results.flatMap((result) => result.threatFamilies ?? []),
    disposition: {
      classification,
      headline: classification === "NotApplicable" ? "Managed scan does not apply" : classification === "Clean" ? "No Known Threats Detected" : "Package scan includes non-clean assemblies",
      summary: classification === "NotApplicable" ? "This package contains no files that MLVScan could assess for managed-code threats." : (classification === "Clean"
        ? `All ${applicable.length} scanned assemblies returned a clean disposition.`
        : `At least one of ${results.length} scanned assemblies returned a ${classification} disposition.`) + (coverage ? ` Outside managed scan coverage: ${coverage}.` : ""),
      blockingRecommended,
      primaryThreatFamilyId: results.find((result) => result.disposition?.primaryThreatFamilyId)?.disposition?.primaryThreatFamilyId ?? null,
      relatedFindingIds: [
        ...new Set(results.flatMap((result) => result.disposition?.relatedFindingIds ?? [])),
      ],
    },
  } satisfies ScanResult
}
