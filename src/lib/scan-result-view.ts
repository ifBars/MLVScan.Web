import type {
  Finding,
  FindingVisibility,
  ScanResult,
  ThreatDispositionClassification,
} from "@/types/mlvscan"

export type ResultPresentationClassification =
  | ThreatDispositionClassification
  | "ManualReviewRequired"

const INCOMPLETE_SCAN_DESCRIPTION_PATTERNS = [
  "could not be scanned",
  "could not complete full il analysis",
  "full il analysis was skipped",
]

const INCOMPLETE_SCAN_RULE_PATTERNS = [
  "incomplete",
  "manualreview",
  "scanwarning",
]

const normalizeText = (value?: string | null): string => value?.trim().toLowerCase() ?? ""

const isIncompleteScanFinding = (finding: Finding): boolean => {
  const description = normalizeText(finding.description)
  const ruleId = normalizeText(finding.ruleId)

  if (INCOMPLETE_SCAN_DESCRIPTION_PATTERNS.some((pattern) => description.includes(pattern))) {
    return true
  }

  return INCOMPLETE_SCAN_RULE_PATTERNS.some((pattern) => ruleId.includes(pattern))
}

const hasVisibilityMetadata = (result: ScanResult): boolean => {
  return result.findings.some(finding => finding.visibility != null)
}

export const getResultClassification = (result: ScanResult): ThreatDispositionClassification => {
  if (result.disposition?.classification) {
    return result.disposition.classification
  }

  if ((result.threatFamilies?.length ?? 0) > 0) {
    return "KnownThreat"
  }

  return result.summary.totalFindings > 0 ? "Suspicious" : "Clean"
}

export const getIncompleteScanFinding = (result: ScanResult): Finding | null => {
  return result.findings.find(isIncompleteScanFinding) ?? null
}

export const getResultPresentationClassification = (
  result: ScanResult
): ResultPresentationClassification => {
  const classification = getResultClassification(result)

  if (classification === "Clean" && getIncompleteScanFinding(result)) {
    return "ManualReviewRequired"
  }

  return classification
}

export const getDefaultFindings = (result: ScanResult): Finding[] => {
  if (!hasVisibilityMetadata(result)) {
    return result.findings
  }

  return result.findings.filter((finding) => finding.visibility !== "Advanced")
}

export const getAdvancedFindings = (result: ScanResult): Finding[] => {
  return result.findings.filter((finding) => finding.visibility === "Advanced")
}

export const getDisplayedFindings = (result: ScanResult, includeAdvanced: boolean): Finding[] => {
  return includeAdvanced ? result.findings : getDefaultFindings(result)
}

export const getActionItems = (result: ScanResult): string[] => {
  const classification = getResultPresentationClassification(result)

  switch (classification) {
    case "KnownThreat":
      return [
        "Do not install or run this mod.",
        "If it already ran, review the affected system for compromise.",
        "Share this report with moderators or trusted community maintainers.",
      ]
    case "Suspicious":
      return [
        "Treat this mod cautiously and review the retained findings before installing.",
        "This may be a false positive, so confirm the source and author before assuming infection.",
        "Rescan after updates or after obtaining a trusted copy.",
      ]
    case "ManualReviewRequired":
      return [
        "Do not treat this file as clean until the incomplete scan warning is reviewed.",
        "Confirm the file is a valid Unity mod and rescan a trusted copy if possible.",
        "Open the advanced diagnostics if you need the raw warning details for triage.",
      ]
    case "Clean":
    default:
      return [
        "No action is recommended from this scan result alone.",
        "Rescan if the mod updates or you receive a different file from another source.",
      ]
  }
}

export const getFindingVisibility = (finding: Finding): FindingVisibility => {
  return finding.visibility === "Advanced" ? "Advanced" : "Default"
}
