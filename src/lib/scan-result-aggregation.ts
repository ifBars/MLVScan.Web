import type { ScanResult, ThreatDispositionClassification } from "@/types/mlvscan"

const rankClassification = (classification?: ThreatDispositionClassification | null): number => {
  switch (classification) {
    case "KnownThreat":
      return 2
    case "Suspicious":
      return 1
    case "Clean":
    default:
      return 0
  }
}

const getPackageClassification = (results: ScanResult[]): ThreatDispositionClassification => {
  const highestRank = Math.max(
    ...results.map((result) => rankClassification(result.disposition?.classification)),
  )

  if (highestRank >= 2) {
    return "KnownThreat"
  }

  if (highestRank >= 1) {
    return "Suspicious"
  }

  return "Clean"
}

export function combineScanResults(packageFileName: string, results: ScanResult[]): ScanResult {
  if (results.length === 1) {
    return results[0]
  }

  const first = results[0]
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
    findings,
    threatFamilies: results.flatMap((result) => result.threatFamilies ?? []),
    disposition: {
      classification,
      headline: classification === "Clean" ? "No Known Threats Detected" : "Package scan includes non-clean assemblies",
      summary: classification === "Clean"
        ? `All ${results.length} scanned assemblies returned a clean disposition.`
        : `At least one of ${results.length} scanned assemblies returned a ${classification} disposition.`,
      blockingRecommended,
      primaryThreatFamilyId: results.find((result) => result.disposition?.primaryThreatFamilyId)?.disposition?.primaryThreatFamilyId ?? null,
      relatedFindingIds: [
        ...new Set(results.flatMap((result) => result.disposition?.relatedFindingIds ?? [])),
      ],
    },
  } satisfies ScanResult
}
